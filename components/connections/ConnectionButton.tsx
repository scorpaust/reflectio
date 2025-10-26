"use client";

import { Button } from "@/components/ui/Button";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";
import { UserPlus, UserCheck, UserX, Crown } from "lucide-react";
import {
  connectionPermissionManager,
  ConnectionAction,
} from "@/lib/services/connectionPermissions";
import { useEffect, useState } from "react";

interface ConnectionButtonProps {
  currentUserId: string;
  targetUserId: string;
  connectionStatus?:
    | "none"
    | "pending_sent"
    | "pending_received"
    | "connected"
    | "blocked";
  onAction?: (action: string, targetUserId: string) => void;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  showUpgradePrompt?: boolean;
}

export function ConnectionButton({
  currentUserId,
  targetUserId,
  connectionStatus = "none",
  onAction,
  isLoading = false,
  size = "sm",
  showUpgradePrompt = true,
}: ConnectionButtonProps) {
  const [availableActions, setAvailableActions] = useState<ConnectionAction[]>(
    []
  );
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  useEffect(() => {
    const loadActions = async () => {
      try {
        setPermissionsLoading(true);
        const actions = await connectionPermissionManager.getConnectionActions(
          currentUserId,
          targetUserId,
          connectionStatus === "pending_sent"
            ? "pending"
            : connectionStatus === "pending_received"
            ? "pending"
            : connectionStatus === "connected"
            ? "accepted"
            : "none"
        );

        setAvailableActions(actions);
        setNeedsUpgrade(actions.some((action) => action.requiresUpgrade));
      } catch (error) {
        console.error("Error loading connection actions:", error);
        setAvailableActions([]);
        setNeedsUpgrade(true);
      } finally {
        setPermissionsLoading(false);
      }
    };

    loadActions();
  }, [currentUserId, targetUserId, connectionStatus]);

  const handleAction = (actionType: string) => {
    onAction?.(actionType, targetUserId);
  };

  const getButtonIcon = (actionType: string) => {
    switch (actionType) {
      case "request":
        return <UserPlus className="w-4 h-4 mr-1" />;
      case "accept":
        return <UserCheck className="w-4 h-4 mr-1" />;
      case "decline":
        return <UserX className="w-4 h-4 mr-1" />;
      case "cancel":
        return <UserX className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getButtonVariant = (actionType: string) => {
    switch (actionType) {
      case "accept":
      case "request":
        return "primary";
      case "decline":
      case "cancel":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (permissionsLoading) {
    return (
      <Button size={size} disabled>
        Carregando...
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {availableActions.map((action) => (
          <Button
            key={action.type}
            size={size}
            variant={getButtonVariant(action.type)}
            onClick={() => handleAction(action.type)}
            disabled={!action.enabled || isLoading}
            isLoading={isLoading}
            className={action.requiresUpgrade ? "opacity-50" : ""}
          >
            {action.requiresUpgrade ? (
              <Crown className="w-4 h-4 mr-1" />
            ) : (
              getButtonIcon(action.type)
            )}
            {action.label}
            {action.requiresUpgrade && " (Premium)"}
          </Button>
        ))}

        {/* Status display for existing connections */}
        {connectionStatus === "connected" && availableActions.length === 0 && (
          <Button size={size} variant="secondary" disabled>
            <UserCheck className="w-4 h-4 mr-1" />
            Conectado
          </Button>
        )}

        {connectionStatus === "pending_sent" &&
          availableActions.length === 0 && (
            <Button size={size} variant="secondary" disabled>
              <UserCheck className="w-4 h-4 mr-1" />
              Convite Enviado
            </Button>
          )}
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && needsUpgrade && connectionStatus === "none" && (
        <UpgradePrompt
          title="Solicitar Conexões"
          description="Apenas utilizadores premium podem solicitar novas conexões. Pode aceitar ou recusar convites recebidos gratuitamente."
          context="connection_request"
          size="sm"
        />
      )}
    </div>
  );
}
