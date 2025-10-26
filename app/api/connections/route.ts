import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, sent, received, connected

    let query = supabase.from("connections").select(`
        *,
        requester:profiles!connections_requester_id_fkey(id, full_name, username, avatar_url, current_level),
        addressee:profiles!connections_addressee_id_fkey(id, full_name, username, avatar_url, current_level)
      `);

    // Filter based on type
    switch (type) {
      case "sent":
        query = query.eq("requester_id", user.id);
        break;
      case "received":
        query = query.eq("addressee_id", user.id);
        break;
      case "connected":
        query = query
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq("status", "accepted");
        break;
      default:
        query = query.or(
          `requester_id.eq.${user.id},addressee_id.eq.${user.id}`
        );
    }

    const { data: connections, error } = await query;

    if (error) {
      console.error("Error fetching connections:", error);
      return NextResponse.json(
        { error: "Erro ao buscar conexões" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error in connections GET:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { requested_id } = await request.json();

    if (!requested_id) {
      return NextResponse.json(
        { error: "ID do utilizador solicitado é obrigatório" },
        { status: 400 }
      );
    }

    // Check if user can request connections
    const permissionResult =
      await connectionPermissionManager.checkConnectionAction(
        user.id,
        "request",
        requested_id
      );

    if (!permissionResult.allowed) {
      return NextResponse.json(
        {
          error:
            permissionResult.reason || "Não autorizado a solicitar conexões",
          upgradePrompt: permissionResult.upgradePrompt,
        },
        { status: 403 }
      );
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${requested_id}),and(requester_id.eq.${requested_id},addressee_id.eq.${user.id})`
      )
      .single();

    if (existingConnection) {
      return NextResponse.json({ error: "Conexão já existe" }, { status: 409 });
    }

    // Create connection request
    const { data: connection, error } = await supabase
      .from("connections")
      .insert({
        requester_id: user.id,
        addressee_id: requested_id,
        requester_level: 1,
        addressee_level: 1,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating connection:", error);
      return NextResponse.json(
        { error: "Erro ao criar solicitação de conexão" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    console.error("Error in connections POST:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
