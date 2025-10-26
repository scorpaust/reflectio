import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();

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

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Sessão não pertence ao usuário" },
        { status: 403 }
      );
    }

    // Buscar perfil atual
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_premium, premium_since, premium_expires_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Erro ao buscar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        mode: session.mode,
      },
      profile: {
        is_premium: profile.is_premium,
        premium_since: profile.premium_since,
        premium_expires_at: profile.premium_expires_at,
      },
      payment_completed:
        session.payment_status === "paid" && profile.is_premium,
    });
  } catch (error: any) {
    console.error("Erro ao verificar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
