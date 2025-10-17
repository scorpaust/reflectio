import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
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

    // Buscar perfil atual
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      return NextResponse.json({
        error: "Erro ao buscar perfil",
        details: profileError,
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro no debug:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Forçar atualização para Premium
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_since: new Date().toISOString(),
        premium_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        stripe_subscription_id: "sub_debug_" + Date.now(), // ID simulado para debug
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);
      return NextResponse.json({
        error: "Erro ao atualizar perfil",
        details: updateError,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      profile: updatedProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro no debug update:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
