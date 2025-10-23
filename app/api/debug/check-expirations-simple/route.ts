import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Função para obter cliente Supabase (com fallback)
async function getSupabaseClient() {
  // Tentar usar service role se disponível
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Fallback para cliente normal (desenvolvimento)
  console.log("⚠️ [DEBUG] Usando cliente normal (sem service role)");
  return await createServerSupabaseClient();
}

export async function GET(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    console.log("🔍 [DEBUG] Verificando expirações de Premium...");

    const supabase = await getSupabaseClient();

    // Buscar todos os usuários Premium com data de expiração
    const { data: premiumUsers, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, is_premium, premium_expires_at, premium_since")
      .eq("is_premium", true)
      .not("premium_expires_at", "is", null);

    if (fetchError) {
      console.error("Erro ao buscar usuários Premium:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar usuários",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      return NextResponse.json({
        success: true,
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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_premium: false })
        .in("id", expiredIds);

      if (updateError) {
        console.error("Erro ao desativar usuários expirados:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: "Erro ao atualizar usuários expirados",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      console.log(
        `✅ [DEBUG] ${expiredUsers.length} usuários Premium expirados desativados`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verificação de expirações concluída",
      checked_count: premiumUsers.length,
      expired_count: expiredUsers.length,
      soon_to_expire_count: soonToExpireUsers.length,
      expired_users: expiredUsers.map((u) => ({
        id: u.id,
        email: u.email,
        expired_at: u.expired_at,
      })),
      soon_to_expire_users: soonToExpireUsers.map((u) => ({
        id: u.id,
        email: u.email,
        expires_at: u.expires_at,
        days_left: u.days_left,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na verificação de expirações:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

// Permitir POST também
export async function POST(request: NextRequest) {
  return GET(request);
}
