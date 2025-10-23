import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/config";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Cliente Supabase com service role para webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error: any) {
    console.error("Erro ao verificar webhook:", error.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log("Webhook recebido:", event.type);

  try {
    switch (event.type) {
      // Subscrição criada com sucesso
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", {
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        });

        if (
          session.mode === "subscription" &&
          session.payment_status === "paid"
        ) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const userId = session.metadata?.user_id;

          console.log("Processing subscription:", { subscriptionId, userId });

          if (userId && subscriptionId) {
            // Buscar detalhes da subscrição
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );

            // Ativar Premium
            const { error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({
                is_premium: true,
                stripe_subscription_id: subscriptionId,
                premium_since: new Date().toISOString(),
                premium_expires_at: new Date(
                  (subscription as any).current_period_end * 1000
                ).toISOString(),
              })
              .eq("id", userId);

            if (updateError) {
              console.error("Erro ao atualizar perfil:", updateError);
              throw updateError;
            }

            console.log(`✅ Premium ativado para usuário: ${userId}`);
          } else {
            console.error("Missing userId or subscriptionId:", {
              userId,
              subscriptionId,
            });
          }
        }
        break;
      }

      // Subscrição renovada
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (subscriptionId) {
          // Buscar subscrição
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          const userId = subscription.metadata?.user_id;

          if (userId) {
            // Atualizar data de expiração
            const periodEnd = new Date(
              (subscription as any).current_period_end * 1000
            );

            await supabaseAdmin
              .from("profiles")
              .update({
                is_premium: true,
                premium_expires_at: periodEnd.toISOString(),
              })
              .eq("id", userId);

            console.log(`✅ Premium renovado para usuário: ${userId}`);
          }
        }
        break;
      }

      // Pagamento falhou
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const userId = subscription.metadata?.user_id;

          if (userId) {
            console.log(`⚠️ Pagamento falhou para usuário: ${userId}`);
            // Você pode enviar email de notificação aqui
          }
        }
        break;
      }

      // Subscrição cancelada
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Desativar Premium
          await supabaseAdmin
            .from("profiles")
            .update({
              is_premium: false,
              premium_expires_at: new Date().toISOString(),
            })
            .eq("id", userId);

          console.log(`❌ Premium cancelado para usuário: ${userId}`);
        }
        break;
      }

      // Subscrição atualizada (mudança de plano, cancelamento agendado, etc)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const isActive = subscription.status === "active";
          const periodEnd = new Date(
            (subscription as any).current_period_end * 1000
          );

          // Verificar se foi cancelada (cancel_at_period_end = true)
          const isCanceled = subscription.cancel_at_period_end;

          await supabaseAdmin
            .from("profiles")
            .update({
              is_premium: isActive,
              premium_expires_at: periodEnd.toISOString(),
              stripe_subscription_id: subscription.id,
            })
            .eq("id", userId);

          if (isCanceled) {
            console.log(
              `🔄 Subscrição cancelada (final do período) para usuário: ${userId}, expira em: ${periodEnd}`
            );
          } else {
            console.log(`🔄 Subscrição atualizada para usuário: ${userId}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
