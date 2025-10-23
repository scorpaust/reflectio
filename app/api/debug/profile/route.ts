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
    console.log("🔍 [DEBUG] Verificando status do perfil...");

    // Verificar se o usuário está autenticado
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuário não autenticado",
          profile: null,
        },
        { status: 401 }
      );
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar perfil",
          details: profileError.message,
          profile: null,
        },
        { status: 500 }
      );
    }

    // Calcular informações adicionais
    let premiumStatus = "Não tem Premium";
    let daysLeft = null;

    if (profile.is_premium) {
      if (profile.premium_expires_at) {
        const now = new Date();
        const expirationDate = new Date(profile.premium_expires_at);
        daysLeft = Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft > 0) {
          premiumStatus = `Premium ativo - ${daysLeft} dias restantes`;
        } else {
          premiumStatus = `Premium expirado há ${Math.abs(daysLeft)} dias`;
        }
      } else {
        premiumStatus = "Premium ativo (sem data de expiração)";
      }
    }

    console.log(`✅ [DEBUG] Status verificado para usuário: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Status do perfil verificado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        email: profile.email,
        is_premium: profile.is_premium,
        premium_since: profile.premium_since,
        premium_expires_at: profile.premium_expires_at,
        stripe_subscription_id: profile.stripe_subscription_id,
        current_level: profile.current_level,
        quality_score: profile.quality_score,
        total_posts: profile.total_posts,
        total_reflections: profile.total_reflections,
        total_connections: profile.total_connections,
      },
      premium_status: premiumStatus,
      days_left: daysLeft,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na verificação do perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
        profile: null,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST para ativar Premium (debug)
export async function POST(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    console.log("🚀 [DEBUG] Ativando Premium para usuário...");

    // Verificar se o usuário está autenticado
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuário não autenticado",
        },
        { status: 401 }
      );
    }

    // Ativar Premium
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setMonth(now.getMonth() + 1); // 1 mês

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        stripe_subscription_id: `sub_debug_${Date.now()}`,
        premium_since: now.toISOString(),
        premium_expires_at: expirationDate.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao ativar Premium:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao ativar Premium",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ [DEBUG] Premium ativado para usuário: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Premium ativado com sucesso",
      user_id: user.id,
      expires_at: expirationDate.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao ativar Premium:", error);
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
