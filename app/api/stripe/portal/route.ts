import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  console.log("🔍 Portal API chamada - início");

  try {
    // Verificar se o usuário está autenticado
    const supabase = await createClient();
    console.log("✅ Supabase client criado");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Erro de autenticação:", authError);
      return NextResponse.json(
        { error: "Erro de autenticação. Faça login novamente." },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado. Faça login novamente." },
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

    let customerId = null;

    // Se tem subscription ID, tentar buscar o customer através dela
    if (
      profile.stripe_subscription_id &&
      !profile.stripe_subscription_id.startsWith("sub_test_") &&
      !profile.stripe_subscription_id.startsWith("sub_test_")
    ) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          profile.stripe_subscription_id
        );
        customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        console.log("Customer ID encontrado via subscription:", customerId);
      } catch (error) {
        console.error("Erro ao buscar subscrição:", error);
      }
    }

    // Se não encontrou customer ID, tentar buscar por email
    if (!customerId) {
      try {
        const customers = await stripe.customers.list({
          email: user.email!,
          limit: 1,
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log("Customer ID encontrado por email:", customerId);
        }
      } catch (error) {
        console.error("Erro ao buscar customer por email:", error);
      }
    }

    // Se ainda não encontrou, criar um novo customer
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
        console.log("Novo customer criado:", customerId);
      } catch (error) {
        console.error("Erro ao criar customer:", error);
        return NextResponse.json(
          { error: "Erro ao criar customer no Stripe" },
          { status: 500 }
        );
      }
    }

    // Verificar se é uma conta de teste local (sem subscription real)
    if (
      !profile.stripe_subscription_id ||
      profile.stripe_subscription_id.startsWith("sub_test_") ||
      profile.stripe_subscription_id.startsWith("sub_test_")
    ) {
      return NextResponse.json(
        {
          error:
            "Esta é uma conta Premium de teste local. Para usar o Portal Stripe, faça um pagamento real através do checkout.",
        },
        { status: 400 }
      );
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
