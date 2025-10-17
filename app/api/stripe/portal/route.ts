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

    // Verificar se é uma subscrição de debug
    if (
      !profile.stripe_subscription_id ||
      profile.stripe_subscription_id.startsWith("sub_debug_")
    ) {
      return NextResponse.json(
        {
          error:
            "Esta é uma conta Premium de teste. Para gerir subscrição real, faça um pagamento através do Stripe.",
        },
        { status: 400 }
      );
    }

    // Buscar o customer ID através da subscrição
    let customerId = null;

    try {
      const subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );
      customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;
    } catch (error) {
      console.error("Erro ao buscar subscrição:", error);
    }

    // Se não encontrou customer ID, criar um novo customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Erro ao criar sessão do portal:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
