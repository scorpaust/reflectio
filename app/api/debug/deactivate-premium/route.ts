import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    // Desativar Premium
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: false,
        premium_since: null,
        premium_expires_at: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao desativar Premium:", updateError);
      return NextResponse.json({
        error: "Erro ao desativar Premium",
        details: updateError,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Premium desativado com sucesso",
      profile: updatedProfile,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao desativar Premium:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
