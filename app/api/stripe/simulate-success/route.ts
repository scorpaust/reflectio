import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// API para simular sucesso de pagamento em desenvolvimento
export async function POST(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID é obrigatório" },
        { status: 400 }
      );
    }

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

    // Simular ativação do Premium (como se o webhook tivesse funcionado)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        stripe_subscription_id: `sub_test_${Date.now()}`, // ID fictício para teste
        premium_since: new Date().toISOString(),
        premium_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 dias
        ).toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao ativar Premium:", updateError);
      return NextResponse.json(
        { error: "Erro ao ativar Premium" },
        { status: 500 }
      );
    }

    console.log(`🧪 [DEV] Premium ativado para usuário: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Premium ativado com sucesso (modo desenvolvimento)",
      user_id: user.id,
      session_id: sessionId,
    });
  } catch (error: any) {
    console.error("Erro ao simular sucesso:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
