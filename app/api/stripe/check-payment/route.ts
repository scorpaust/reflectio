import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    // Buscar a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    console.log("Session details:", {
      id: session.id,
      payment_status: session.payment_status,
      mode: session.mode,
      customer_email: session.customer_email,
    });

    if (session.payment_status === "paid" && session.mode === "subscription") {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        // Buscar detalhes da subscrição
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        // Atualizar perfil do usuário
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            stripe_subscription_id: subscriptionId,
            premium_since: new Date().toISOString(),
            premium_expires_at: new Date(
              (subscription as any).current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
          throw updateError;
        }

        console.log(`✅ Premium ativado para usuário: ${user.id}`);

        return NextResponse.json({
          success: true,
          isPremium: true,
          subscriptionId,
        });
      }
    }

    return NextResponse.json({
      success: false,
      isPremium: false,
      paymentStatus: session.payment_status,
    });
  } catch (error: any) {
    console.error("Erro ao verificar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
