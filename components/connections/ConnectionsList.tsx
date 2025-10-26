"use client";

import { UserProfile } from "@/types/user.types";
import { UserCard } from "./UserCard";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";
import { useEffect, useState } from "react";
import { Users, Crown } from "lucide-react";

interface ConnectionsListProps {
  users: UserProfile[];
  currentUserId: string;
  currentUserLevel: number;
  onConnect?: (userId: string) => void;
  onAccept?: (userId: string) => void;
  onReject?: (userId: string) => void;
  isLoading?: boolean;
  showLimitations?: boolean;
}

export function ConnectionsList({
  users,
  currentUserId,
  currentUserLevel,
  onConnect,
  onAccept,
  onReject,
  isLoading = false,
  showLimitations = true,
}: ConnectionsListProps) {
  const [limitations, setLimitations] = useState<{
    canRequest: boolean;
    canRespond: boolean;
    limitations: string[];
    upgradePrompt?: boolean;
  } | null>(null);

  useEffect(() => {
    const loadLimitations = async () => {
      try {
        const result =
          await connectionPermissionManager.getConnectionLimitations(
            currentUserId
          );
        setLimitations(result);
      } catch (error) {
        console.error("Error loading connection limitations:", error);
      }
    };

    if (showLimitations) {
      loadLimitations();
    }
  }, [currentUserId, showLimitations]);

  return (
    <div className="space-y-4">
      {/* Connection Limitations Info */}
      {showLimitations && limitations && limitations.limitations.length > 0 && (
        <div className="mb-6">
          <UpgradePrompt
            title="Limitações de Conexão"
            description={
              limitations.limitations.join(". ") +
              ". Faça upgrade para premium para solicitar conexões ilimitadas."
            }
            context="connection_request"
            size="md"
          />
        </div>
      )}

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum utilizador encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os seus critérios de pesquisa.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              currentUserLevel={currentUserLevel}
              onConnect={onConnect}
              onAccept={onAccept}
              onReject={onReject}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Premium Features Info */}
      {showLimitations && limitations && !limitations.canRequest && (
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Funcionalidades Premium de Conexões
              </h4>
              <ul className="text-gray-600 text-sm space-y-1 mb-4">
                <li>• Solicitar conexões ilimitadas</li>
                <li>• Conectar com utilizadores de qualquer nível</li>
                <li>• Prioridade nas sugestões de conexão</li>
                <li>• Acesso a estatísticas detalhadas de rede</li>
              </ul>
              <p className="text-gray-500 text-xs">
                Como utilizador gratuito, pode aceitar e recusar convites
                recebidos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
