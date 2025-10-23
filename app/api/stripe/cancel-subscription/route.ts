import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
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

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é Premium
    if (!profile.is_premium) {
      return NextResponse.json(
        { error: "Usuário não tem subscrição ativa" },
        { status: 400 }
      );
    }

    // Verificar se é uma subscrição local de teste (apenas IDs específicos de debug/simulação)
    const isLocalTestAccount =
      !profile.stripe_subscription_id ||
      profile.stripe_subscription_id.startsWith("sub_test_") ||
      profile.stripe_subscription_id.startsWith("sub_debug_") ||
      profile.stripe_subscription_id.includes("simulate") ||
      profile.stripe_subscription_id.includes("debug");

    if (isLocalTestAccount) {
      console.log(
        `🧪 Cancelando conta de teste local para usuário: ${user.id}`
      );

      // Para contas de teste local, desativar imediatamente
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_expires_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Erro ao desativar Premium de teste:", updateError);
        return NextResponse.json(
          { error: "Erro ao cancelar subscrição de teste" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Subscrição de teste cancelada com sucesso",
        immediate_cancellation: true,
      });
    }

    console.log(
      `💳 Tentando cancelar subscrição real no Stripe: ${profile.stripe_subscription_id}`
    );

    try {
      // Cancelar subscrição no Stripe (no final do período)
      const subscription = await stripe.subscriptions.update(
        profile.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      console.log(
        `✅ Subscrição cancelada no Stripe, expira em: ${new Date(
          subscription.current_period_end * 1000
        )}`
      );

      // Atualizar no banco que a subscrição será cancelada
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          premium_expires_at: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          // IMPORTANTE: Manter is_premium = true até o final do período
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Erro ao atualizar perfil:", updateError);
        return NextResponse.json(
          { error: "Erro ao atualizar dados da subscrição" },
          { status: 500 }
        );
      }

      const expirationDate = new Date(subscription.current_period_end * 1000);

      return NextResponse.json({
        success: true,
        message:
          "Subscrição cancelada com sucesso. Você manterá acesso Premium até o final do período pago.",
        expires_at: expirationDate.toISOString(),
        immediate_cancellation: false,
      });
    } catch (stripeError: any) {
      console.error("Erro ao cancelar no Stripe:", stripeError);

      // Se a subscrição não existe no Stripe, pode ser uma conta de teste que passou pela verificação
      if (stripeError.code === "resource_missing") {
        console.log(
          "⚠️ Subscrição não encontrada no Stripe, tratando como conta de teste"
        );

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            premium_expires_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Erro ao desativar Premium:", updateError);
          return NextResponse.json(
            { error: "Erro ao cancelar subscrição" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Subscrição cancelada (conta de teste)",
          immediate_cancellation: true,
        });
      }

      // Para outros erros do Stripe, não desativar imediatamente
      return NextResponse.json(
        { error: `Erro ao cancelar no Stripe: ${stripeError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao cancelar subscrição:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
