import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// API para testar o portal do Stripe em desenvolvimento
export async function POST(request: NextRequest) {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta API só funciona em desenvolvimento" },
      { status: 403 }
    );
  }

  try {
    // Verificar se o usuário está autenticado
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Para debug, permitir teste mesmo sem autenticação
    let testEmail = "test@reflectio.com";
    let testUserId = "debug-user-id";

    if (user && !authError) {
      testEmail = user.email!;
      testUserId = user.id;
      console.log(
        "🧪 [DEBUG] Testando portal para usuário autenticado:",
        testEmail
      );
    } else {
      console.log(
        "🧪 [DEBUG] Testando portal com usuário de debug:",
        testEmail
      );
    }

    // Buscar ou criar customer
    let customerId = null;

    try {
      // Primeiro, tentar encontrar customer existente
      const customers = await stripe.customers.list({
        email: testEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("🧪 [DEBUG] Customer existente encontrado:", customerId);
      } else {
        // Criar novo customer
        const customer = await stripe.customers.create({
          email: testEmail,
          name: testEmail.split("@")[0],
          metadata: {
            user_id: testUserId,
            source: "debug_portal_test",
          },
        });
        customerId = customer.id;
        console.log("🧪 [DEBUG] Novo customer criado:", customerId);
      }

      // Criar sessão do portal
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/profile?portal_test=true`,
      });

      console.log("🧪 [DEBUG] Portal session criada:", portalSession.id);

      return NextResponse.json({
        success: true,
        url: portalSession.url,
        customer_id: customerId,
        session_id: portalSession.id,
        message: "Portal de teste criado com sucesso",
      });
    } catch (stripeError: any) {
      console.error("🧪 [DEBUG] Erro do Stripe:", stripeError);

      return NextResponse.json(
        {
          error: `Erro do Stripe: ${stripeError.message}`,
          code: stripeError.code,
          type: stripeError.type,
          details: stripeError,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("🧪 [DEBUG] Erro geral:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
