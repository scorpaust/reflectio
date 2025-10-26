import { createClient } from "@/lib/supabase/client";
import { permissionService } from "./permissions";

export interface ConnectionAction {
  type: "request" | "accept" | "decline" | "cancel";
  label: string;
  enabled: boolean;
  requiresUpgrade?: boolean;
}

export interface ConnectionPermissionResult {
  allowed: boolean;
  reason?: string;
  upgradePrompt?: boolean;
}

export class ConnectionPermissionManager {
  private supabase = createClient();

  /**
   * Verifica se o utilizador pode solicitar uma conexão
   */
  async canRequestConnection(requesterId: string): Promise<boolean> {
    try {
      const result = await permissionService.checkConnectionPermission(
        requesterId,
        "request"
      );
      return result.allowed;
    } catch (error) {
      console.error("Error checking request connection permission:", error);
      return false;
    }
  }

  /**
   * Verifica se o utilizador pode responder a uma conexão (aceitar/recusar)
   */
  async canRespondToConnection(userId: string): Promise<boolean> {
    try {
      const result = await permissionService.checkConnectionPermission(
        userId,
        "respond"
      );
      return result.allowed;
    } catch (error) {
      console.error("Error checking respond connection permission:", error);
      return false;
    }
  }

  /**
   * Obtém as ações de conexão disponíveis para um utilizador
   */
  async getConnectionActions(
    userId: string,
    targetUserId?: string,
    existingConnectionStatus?: "pending" | "accepted" | "none"
  ): Promise<ConnectionAction[]> {
    try {
      const permissions = await permissionService.getUserPermissions(userId);
      const actions: ConnectionAction[] = [];

      // Se não há conexão existente
      if (!existingConnectionStatus || existingConnectionStatus === "none") {
        // Ação de solicitar conexão
        actions.push({
          type: "request",
          label: "Solicitar Conexão",
          enabled: permissions.canRequestConnection,
          requiresUpgrade: !permissions.canRequestConnection,
        });
      }

      // Se há uma conexão pendente
      if (existingConnectionStatus === "pending") {
        // Verificar se é o utilizador que pode responder (recebeu o pedido)
        const canRespond = await this.canRespondToConnection(userId);

        if (canRespond) {
          actions.push(
            {
              type: "accept",
              label: "Aceitar",
              enabled: true,
            },
            {
              type: "decline",
              label: "Recusar",
              enabled: true,
            }
          );
        } else {
          // Se é quem enviou o pedido, pode cancelar
          actions.push({
            type: "cancel",
            label: "Cancelar Pedido",
            enabled: true,
          });
        }
      }

      return actions;
    } catch (error) {
      console.error("Error getting connection actions:", error);
      return [];
    }
  }

  /**
   * Verifica permissões detalhadas para uma ação de conexão específica
   */
  async checkConnectionAction(
    userId: string,
    action: "request" | "accept" | "decline" | "cancel",
    targetUserId?: string
  ): Promise<ConnectionPermissionResult> {
    try {
      switch (action) {
        case "request":
          const requestResult =
            await permissionService.checkConnectionPermission(
              userId,
              "request"
            );
          return {
            allowed: requestResult.allowed,
            reason: requestResult.reason,
            upgradePrompt: requestResult.upgradePrompt,
          };

        case "accept":
        case "decline":
          const respondResult =
            await permissionService.checkConnectionPermission(
              userId,
              "respond"
            );
          return {
            allowed: respondResult.allowed,
            reason: respondResult.reason,
            upgradePrompt: respondResult.upgradePrompt,
          };

        case "cancel":
          // Utilizadores podem sempre cancelar os seus próprios pedidos
          return { allowed: true };

        default:
          return {
            allowed: false,
            reason: "Ação não reconhecida",
          };
      }
    } catch (error) {
      console.error("Error checking connection action:", error);
      return {
        allowed: false,
        reason: "Erro ao verificar permissões",
      };
    }
  }

  /**
   * Obtém informações sobre limitações de conexão para um utilizador
   */
  async getConnectionLimitations(userId: string): Promise<{
    canRequest: boolean;
    canRespond: boolean;
    limitations: string[];
    upgradePrompt?: boolean;
  }> {
    try {
      const permissions = await permissionService.getUserPermissions(userId);
      const limitations: string[] = [];
      let upgradePrompt = false;

      if (!permissions.canRequestConnection) {
        limitations.push("Não pode solicitar novas conexões");
        upgradePrompt = true;
      }

      return {
        canRequest: permissions.canRequestConnection,
        canRespond: true, // Todos podem responder
        limitations,
        upgradePrompt,
      };
    } catch (error) {
      console.error("Error getting connection limitations:", error);
      return {
        canRequest: false,
        canRespond: true,
        limitations: ["Erro ao verificar limitações"],
      };
    }
  }
}

// Instância singleton do serviço
export const connectionPermissionManager = new ConnectionPermissionManager();
