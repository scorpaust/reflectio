import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
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

    // Ativar Premium diretamente (para testes ou quando webhook falha)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_since: new Date().toISOString(),
        premium_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 dias
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao ativar Premium:", updateError);
      return NextResponse.json(
        { error: "Erro ao ativar Premium" },
        { status: 500 }
      );
    }

    console.log(`✅ Premium ativado manualmente para usuário: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Premium ativado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao ativar Premium:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
