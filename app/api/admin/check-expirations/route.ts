import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com service role para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verificar se é ambiente de desenvolvimento ou se tem chave de admin
    let adminKey = "dev-test"; // Default para desenvolvimento

    try {
      const body = await request.json();
      adminKey = body.adminKey || "dev-test";
    } catch (jsonError) {
      // Se não conseguir fazer parse do JSON, usar chave padrão de dev
      console.log("⚠️ [ADMIN] Usando chave padrão de desenvolvimento");
    }

    if (
      process.env.NODE_ENV === "production" &&
      adminKey !== process.env.ADMIN_SECRET_KEY
    ) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    console.log("🔍 [ADMIN] Verificando expirações de Premium...");

    // Buscar todos os usuários Premium com data de expiração
    const { data: premiumUsers, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_premium, premium_expires_at, premium_since")
      .eq("is_premium", true)
      .not("premium_expires_at", "is", null);

    if (fetchError) {
      console.error("Erro ao buscar usuários Premium:", fetchError);
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      );
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      return NextResponse.json({
        message: "Nenhum usuário Premium com data de expiração encontrado",
        expired_count: 0,
        checked_count: 0,
      });
    }

    const now = new Date();
    const expiredUsers = [];
    const soonToExpireUsers = [];

    // Verificar cada usuário
    for (const user of premiumUsers) {
      const expirationDate = new Date(user.premium_expires_at!);
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (now > expirationDate) {
        // Usuário expirado
        expiredUsers.push({
          id: user.id,
          email: user.email,
          expired_at: user.premium_expires_at,
          days_expired: Math.abs(daysUntilExpiration),
        });
      } else if (daysUntilExpiration <= 7) {
        // Expira em breve
        soonToExpireUsers.push({
          id: user.id,
          email: user.email,
          expires_at: user.premium_expires_at,
          days_left: daysUntilExpiration,
        });
      }
    }

    // Desativar usuários expirados
    if (expiredUsers.length > 0) {
      const expiredIds = expiredUsers.map((u) => u.id);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_premium: false })
        .in("id", expiredIds);

      if (updateError) {
        console.error("Erro ao desativar usuários expirados:", updateError);
        return NextResponse.json(
          { error: "Erro ao atualizar usuários expirados" },
          { status: 500 }
        );
      }

      console.log(
        `✅ [ADMIN] ${expiredUsers.length} usuários Premium expirados desativados`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verificação de expirações concluída",
      checked_count: premiumUsers.length,
      expired_count: expiredUsers.length,
      soon_to_expire_count: soonToExpireUsers.length,
      expired_users: expiredUsers,
      soon_to_expire_users: soonToExpireUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na verificação de expirações:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Permitir GET também para facilitar testes
export async function GET(request: NextRequest) {
  // Em desenvolvimento, permitir GET sem autenticação
  if (process.env.NODE_ENV !== "production") {
    return POST(request);
  }

  return NextResponse.json(
    { error: "Método não permitido em produção" },
    { status: 405 }
  );
}
