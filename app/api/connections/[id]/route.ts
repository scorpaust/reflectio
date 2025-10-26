import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { action } = await request.json(); // "accept", "decline", "cancel"
    const resolvedParams = await params;
    const connectionId = resolvedParams.id;

    if (!action || !["accept", "decline", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    // Get the connection
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Conexão não encontrada" },
        { status: 404 }
      );
    }

    // Validate permissions based on action
    let permissionResult;

    if (action === "accept" || action === "decline") {
      // Only the requested user can accept/decline
      if (connection.addressee_id !== user.id) {
        return NextResponse.json(
          { error: "Apenas o utilizador solicitado pode aceitar/recusar" },
          { status: 403 }
        );
      }

      permissionResult =
        await connectionPermissionManager.checkConnectionAction(
          user.id,
          action
        );
    } else if (action === "cancel") {
      // Only the requester can cancel
      if (connection.requester_id !== user.id) {
        return NextResponse.json(
          { error: "Apenas o solicitante pode cancelar" },
          { status: 403 }
        );
      }

      permissionResult =
        await connectionPermissionManager.checkConnectionAction(
          user.id,
          action
        );
    }

    if (!permissionResult?.allowed) {
      return NextResponse.json(
        {
          error: permissionResult?.reason || "Não autorizado para esta ação",
          upgradePrompt: permissionResult?.upgradePrompt,
        },
        { status: 403 }
      );
    }

    // Update connection status
    let newStatus: "accepted" | "rejected" | "blocked" | null;
    switch (action) {
      case "accept":
        newStatus = "accepted";
        break;
      case "decline":
        newStatus = "rejected";
        break;
      case "cancel":
        newStatus = "blocked";
        break;
      default:
        newStatus = null;
    }

    const { data: updatedConnection, error: updateError } = await supabase
      .from("connections")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating connection:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar conexão" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connection: updatedConnection });
  } catch (error) {
    console.error("Error in connection PATCH:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const connectionId = resolvedParams.id;

    // Get the connection
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Conexão não encontrada" },
        { status: 404 }
      );
    }

    // Only participants can delete the connection
    if (
      connection.requester_id !== user.id &&
      connection.addressee_id !== user.id
    ) {
      return NextResponse.json(
        { error: "Não autorizado a remover esta conexão" },
        { status: 403 }
      );
    }

    // Delete the connection
    const { error: deleteError } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (deleteError) {
      console.error("Error deleting connection:", deleteError);
      return NextResponse.json(
        { error: "Erro ao remover conexão" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Conexão removida com sucesso" });
  } catch (error) {
    console.error("Error in connection DELETE:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
