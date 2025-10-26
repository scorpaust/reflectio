"use client";

import { UserProfile, LEVELS } from "@/types/user.types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";
import { getInitials } from "@/lib/utils";
import { UserPlus, UserCheck, UserX, Lock, Crown } from "lucide-react";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";
import { useEffect, useState } from "react";

interface UserCardProps {
  user: UserProfile;
  currentUserId: string;
  currentUserLevel: number;
  connectionStatus?:
    | "none"
    | "pending_sent"
    | "pending_received"
    | "connected"
    | "blocked";
  onConnect?: (userId: string) => void;
  onAccept?: (userId: string) => void;
  onReject?: (userId: string) => void;
  isLoading?: boolean;
}

export function UserCard({
  user,
  currentUserId,
  currentUserLevel,
  connectionStatus = "none",
  onConnect,
  onAccept,
  onReject,
  isLoading = false,
}: UserCardProps) {
  const userLevel = LEVELS[user.current_level || 1];
  const canConnect = (user.current_level || 1) <= currentUserLevel;

  const [canRequestConnection, setCanRequestConnection] = useState(true);
  const [canRespondToConnection, setCanRespondToConnection] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const [canRequest, canRespond] = await Promise.all([
          connectionPermissionManager.canRequestConnection(currentUserId),
          connectionPermissionManager.canRespondToConnection(currentUserId),
        ]);

        setCanRequestConnection(canRequest);
        setCanRespondToConnection(canRespond);
        setShowUpgradePrompt(!canRequest);
      } catch (error) {
        console.error("Error checking connection permissions:", error);
        setCanRequestConnection(false);
        setShowUpgradePrompt(true);
      } finally {
        setPermissionsLoading(false);
      }
    };

    checkPermissions();
  }, [currentUserId]);

  return (
    <Card hover>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg truncate">
            {user.full_name}
          </h3>
          {user.username && (
            <p className="text-gray-500 text-sm mb-2">@{user.username}</p>
          )}

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`${userLevel.color} flex items-center gap-1 text-sm font-semibold`}
            >
              <span className="text-base">{userLevel.icon}</span>
              {userLevel.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 text-sm">
              {user.total_posts} posts
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 text-sm">
              {user.total_reflections} reflexões
            </span>
          </div>

          {user.bio && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {user.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {connectionStatus === "none" && (
                <>
                  {canConnect ? (
                    <>
                      {canRequestConnection ? (
                        <Button
                          size="sm"
                          onClick={() => onConnect?.(user.id)}
                          disabled={isLoading || permissionsLoading}
                          isLoading={isLoading}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Conectar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled
                          className="opacity-50"
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Conectar (Premium)
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Lock className="w-4 h-4" />
                      <span>
                        Nível {userLevel.name} requer nível{" "}
                        {LEVELS[user.current_level || 1].name} ou superior
                      </span>
                    </div>
                  )}
                </>
              )}

              {connectionStatus === "pending_sent" && (
                <Button size="sm" variant="secondary" disabled>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Convite Enviado
                </Button>
              )}

              {connectionStatus === "pending_received" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAccept?.(user.id)}
                    disabled={isLoading || !canRespondToConnection}
                    isLoading={isLoading}
                  >
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onReject?.(user.id)}
                    disabled={isLoading || !canRespondToConnection}
                  >
                    Recusar
                  </Button>
                </div>
              )}

              {connectionStatus === "connected" && (
                <Button size="sm" variant="secondary" disabled>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Conectado
                </Button>
              )}
            </div>

            {/* Upgrade Prompt for Connection Restrictions */}
            {showUpgradePrompt && connectionStatus === "none" && canConnect && (
              <UpgradePrompt
                title="Conectar com outros utilizadores"
                description="Apenas utilizadores premium podem solicitar novas conexões. Pode aceitar ou recusar convites recebidos."
                context="connection_request"
                size="sm"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
