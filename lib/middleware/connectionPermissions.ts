import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";

export interface ConnectionPermissionContext {
  user: any;
  supabase: any;
}

/**
 * Middleware para verificar permissões de conexão
 */
export async function withConnectionPermissions(
  request: NextRequest,
  handler: (context: ConnectionPermissionContext) => Promise<NextResponse>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const context: ConnectionPermissionContext = {
      user,
      supabase,
    };

    return await handler(context);
  } catch (error) {
    console.error("Error in connection permissions middleware:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * Valida se o utilizador pode realizar uma ação de conexão específica
 */
export async function validateConnectionAction(
  userId: string,
  action: "request" | "accept" | "decline" | "cancel",
  targetUserId?: string
): Promise<{
  allowed: boolean;
  reason?: string;
  upgradePrompt?: boolean;
  statusCode?: number;
}> {
  try {
    const result = await connectionPermissionManager.checkConnectionAction(
      userId,
      action,
      targetUserId
    );

    return {
      allowed: result.allowed,
      reason: result.reason,
      upgradePrompt: result.upgradePrompt,
      statusCode: result.allowed ? 200 : 403,
    };
  } catch (error) {
    console.error("Error validating connection action:", error);
    return {
      allowed: false,
      reason: "Erro ao validar permissões",
      statusCode: 500,
    };
  }
}

/**
 * Verifica se uma conexão existe entre dois utilizadores
 */
export async function checkExistingConnection(
  supabase: any,
  userId1: string,
  userId2: string
): Promise<{
  exists: boolean;
  connection?: any;
  status?: string;
}> {
  try {
    const { data: connection, error } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(requester_id.eq.${userId1},requested_id.eq.${userId2}),and(requester_id.eq.${userId2},requested_id.eq.${userId1})`
      )
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking existing connection:", error);
      return { exists: false };
    }

    return {
      exists: !!connection,
      connection,
      status: connection?.status,
    };
  } catch (error) {
    console.error("Error in checkExistingConnection:", error);
    return { exists: false };
  }
}

/**
 * Valida se o utilizador tem permissão para acessar uma conexão específica
 */
export async function validateConnectionAccess(
  supabase: any,
  userId: string,
  connectionId: string
): Promise<{
  allowed: boolean;
  connection?: any;
  reason?: string;
}> {
  try {
    const { data: connection, error } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error || !connection) {
      return {
        allowed: false,
        reason: "Conexão não encontrada",
      };
    }

    // Verificar se o utilizador é participante da conexão
    const isParticipant =
      connection.requester_id === userId || connection.requested_id === userId;

    if (!isParticipant) {
      return {
        allowed: false,
        reason: "Não autorizado a acessar esta conexão",
      };
    }

    return {
      allowed: true,
      connection,
    };
  } catch (error) {
    console.error("Error validating connection access:", error);
    return {
      allowed: false,
      reason: "Erro ao validar acesso",
    };
  }
}
