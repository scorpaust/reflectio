import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// API para simular uma subscrição real em desenvolvimento
export async function POST(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    const { planType = "monthly" } = await request.json();

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

    // Calcular data de expiração baseada no plano
    const now = new Date();
    const expirationDate = new Date(now);

    if (planType === "yearly") {
      expirationDate.setFullYear(now.getFullYear() + 1);
    } else {
      expirationDate.setMonth(now.getMonth() + 1);
    }

    // Simular uma subscrição real do Stripe com ID válido
    const fakeStripeSubId = `sub_${Date.now()}_${planType}_real_sim`;

    // Ativar Premium com dados que simulam uma subscrição real
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        stripe_subscription_id: fakeStripeSubId,
        premium_since: now.toISOString(),
        premium_expires_at: expirationDate.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao simular subscrição real:", updateError);
      return NextResponse.json(
        { error: "Erro ao ativar Premium simulado" },
        { status: 500 }
      );
    }

    console.log(`🎭 [DEV] Subscrição real simulada para usuário: ${user.id}`);
    console.log(`   - Plano: ${planType}`);
    console.log(`   - Expira em: ${expirationDate}`);
    console.log(`   - Stripe ID: ${fakeStripeSubId}`);

    return NextResponse.json({
      success: true,
      message: `Subscrição ${planType} real simulada com sucesso`,
      user_id: user.id,
      subscription_id: fakeStripeSubId,
      plan_type: planType,
      expires_at: expirationDate.toISOString(),
      note: "Esta é uma simulação de subscrição real para testes de cancelamento",
    });
  } catch (error: any) {
    console.error("Erro ao simular subscrição real:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
