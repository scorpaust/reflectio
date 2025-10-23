import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    console.log("🧪 [DEBUG] Simulando verificação de expirações...");

    // Verificar se o usuário está autenticado
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Buscar apenas o perfil do usuário atual (não precisa de service role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, is_premium, premium_expires_at, premium_since")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar perfil do usuário",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        message: "Perfil não encontrado",
        checked_count: 0,
        expired_count: 0,
      });
    }

    let expiredCount = 0;
    let message = "Verificação simulada concluída";

    // Verificar se o usuário atual tem Premium expirado
    if (profile.is_premium && profile.premium_expires_at) {
      const now = new Date();
      const expirationDate = new Date(profile.premium_expires_at);

      if (now > expirationDate) {
        console.log(
          `🕒 [DEBUG] Premium expirado para usuário atual: ${user.id}`
        );

        // Tentar desativar Premium do usuário atual
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_premium: false })
          .eq("id", user.id);

        if (updateError) {
          console.error("Erro ao desativar Premium:", updateError);
          return NextResponse.json(
            {
              success: false,
              error: "Erro ao desativar Premium expirado",
              details: updateError.message,
            },
            { status: 500 }
          );
        }

        expiredCount = 1;
        message = "Premium expirado desativado para usuário atual";
        console.log(`✅ [DEBUG] Premium desativado para usuário: ${user.id}`);
      } else {
        const daysLeft = Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        message = `Premium ativo, expira em ${daysLeft} dias`;
      }
    } else if (profile.is_premium && !profile.premium_expires_at) {
      message = "Premium ativo sem data de expiração (conta de teste)";
    } else {
      message = "Usuário não tem Premium ativo";
    }

    return NextResponse.json({
      success: true,
      message,
      checked_count: 1,
      expired_count: expiredCount,
      user_profile: {
        id: profile.id,
        email: profile.email,
        is_premium: profile.is_premium,
        premium_expires_at: profile.premium_expires_at,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na simulação de verificação:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Permitir POST também
export async function POST(request: NextRequest) {
  return GET(request);
}
