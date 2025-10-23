import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com service role para operações de cron
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (Vercel Cron ou chave secreta)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "🕒 [CRON] Iniciando verificação automática de expirações Premium..."
    );

    // Buscar todos os usuários Premium com data de expiração
    const { data: premiumUsers, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_premium, premium_expires_at")
      .eq("is_premium", true)
      .not("premium_expires_at", "is", null);

    if (fetchError) {
      console.error("❌ [CRON] Erro ao buscar usuários Premium:", fetchError);
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      );
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      console.log(
        "ℹ️ [CRON] Nenhum usuário Premium com data de expiração encontrado"
      );
      return NextResponse.json({
        success: true,
        message: "Nenhum usuário Premium para verificar",
        expired_count: 0,
        checked_count: 0,
      });
    }

    const now = new Date();
    const expiredUserIds = [];
    const expiredUsers = [];

    // Verificar cada usuário
    for (const user of premiumUsers) {
      const expirationDate = new Date(user.premium_expires_at!);

      if (now > expirationDate) {
        expiredUserIds.push(user.id);
        expiredUsers.push({
          id: user.id,
          email: user.email,
          expired_at: user.premium_expires_at,
        });
      }
    }

    // Desativar usuários expirados em lote
    if (expiredUserIds.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_premium: false })
        .in("id", expiredUserIds);

      if (updateError) {
        console.error(
          "❌ [CRON] Erro ao desativar usuários expirados:",
          updateError
        );
        return NextResponse.json(
          { error: "Erro ao atualizar usuários expirados" },
          { status: 500 }
        );
      }

      console.log(
        `✅ [CRON] ${expiredUserIds.length} usuários Premium expirados desativados automaticamente`
      );

      // Log detalhado dos usuários desativados
      expiredUsers.forEach((user) => {
        console.log(`   - ${user.email} (expirou em: ${user.expired_at})`);
      });
    } else {
      console.log(
        `✅ [CRON] Verificação concluída: ${premiumUsers.length} usuários verificados, nenhum expirado`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verificação de expirações concluída",
      checked_count: premiumUsers.length,
      expired_count: expiredUserIds.length,
      expired_users: expiredUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(
      "❌ [CRON] Erro na verificação automática de expirações:",
      error
    );
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Permitir POST também para testes manuais
export async function POST(request: NextRequest) {
  return GET(request);
}
