"use client";

import { AlertTriangle, Clock, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  getDaysUntilExpiration,
  isPremiumExpiringSoon,
} from "@/lib/utils/premium-expiration";

interface ExpirationWarningProps {
  premiumExpiresAt: string | null;
  onRenew?: () => void;
}

export function ExpirationWarning({
  premiumExpiresAt,
  onRenew,
}: ExpirationWarningProps) {
  if (!premiumExpiresAt) return null;

  const daysLeft = getDaysUntilExpiration(premiumExpiresAt);
  const isExpiringSoon = isPremiumExpiringSoon(premiumExpiresAt);

  // Não mostrar se não está expirando em breve
  if (!isExpiringSoon || daysLeft === null) return null;

  const isExpired = daysLeft === 0;
  const isUrgent = daysLeft <= 3;

  return (
    <Card
      className={`border-2 ${
        isExpired
          ? "border-red-300 bg-red-50"
          : isUrgent
          ? "border-orange-300 bg-orange-50"
          : "border-yellow-300 bg-yellow-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isExpired
              ? "bg-red-100"
              : isUrgent
              ? "bg-orange-100"
              : "bg-yellow-100"
          }`}
        >
          {isExpired ? (
            <AlertTriangle
              className={`w-6 h-6 ${
                isExpired
                  ? "text-red-600"
                  : isUrgent
                  ? "text-orange-600"
                  : "text-yellow-600"
              }`}
            />
          ) : (
            <Clock
              className={`w-6 h-6 ${
                isExpired
                  ? "text-red-600"
                  : isUrgent
                  ? "text-orange-600"
                  : "text-yellow-600"
              }`}
            />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`font-bold text-lg mb-2 ${
              isExpired
                ? "text-red-800"
                : isUrgent
                ? "text-orange-800"
                : "text-yellow-800"
            }`}
          >
            {isExpired ? "Premium Expirado" : "Premium Expira em Breve"}
          </h3>

          <div
            className={`text-sm mb-3 ${
              isExpired
                ? "text-red-700"
                : isUrgent
                ? "text-orange-700"
                : "text-yellow-700"
            }`}
          >
            {isExpired ? (
              <p>
                Seu Premium expirou em{" "}
                <strong>{formatDate(premiumExpiresAt)}</strong>. Renove agora
                para continuar aproveitando todos os recursos.
              </p>
            ) : (
              <p>
                Seu Premium expira em{" "}
                <strong>
                  {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                </strong>
                ({formatDate(premiumExpiresAt)}). Renove antes para não perder o
                acesso.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Crown
              className={`w-4 h-4 ${
                isExpired
                  ? "text-red-600"
                  : isUrgent
                  ? "text-orange-600"
                  : "text-yellow-600"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isExpired
                  ? "text-red-600"
                  : isUrgent
                  ? "text-orange-600"
                  : "text-yellow-600"
              }`}
            >
              {isExpired
                ? "Acesso Premium Suspenso"
                : "Recursos Premium Ativos"}
            </span>
          </div>
        </div>

        {onRenew && (
          <div className="flex-shrink-0">
            <Button
              size="sm"
              variant={
                isExpired ? "danger" : isUrgent ? "primary" : "secondary"
              }
              onClick={onRenew}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {isExpired ? "Renovar Agora" : "Renovar Premium"}
            </Button>
          </div>
        )}
      </div>

      {!isExpired && (
        <div
          className={`mt-4 p-3 rounded-lg border ${
            isUrgent
              ? "bg-orange-100 border-orange-200"
              : "bg-yellow-100 border-yellow-200"
          }`}
        >
          <p
            className={`text-xs ${
              isUrgent ? "text-orange-800" : "text-yellow-800"
            }`}
          >
            💡 <strong>Dica:</strong> Renove antes da expiração para evitar
            interrupção no acesso aos recursos Premium.
          </p>
        </div>
      )}
    </Card>
  );
}
