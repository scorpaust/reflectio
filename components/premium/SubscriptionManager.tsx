"use client";

import { useState } from "react";
import { Crown, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface SubscriptionManagerProps {
  isPremium: boolean;
  premiumSince: string | null;
  premiumExpiresAt: string | null;
}

export function SubscriptionManager({
  isPremium,
  premiumSince,
  premiumExpiresAt,
}: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Verificar se é uma conta de teste (sem data de expiração ou muito recente)
  const isTestAccount =
    !premiumExpiresAt ||
    (premiumSince &&
      new Date(premiumSince) > new Date(Date.now() - 5 * 60 * 1000)); // Últimos 5 minutos

  const handleManageSubscription = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        // Se for erro de subscrição não encontrada, mostrar mensagem específica
        if (data.error?.includes("subscrição")) {
          setError(
            "Esta é uma conta Premium de teste. Para gerir uma subscrição real, faça um pagamento através do Stripe."
          );
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || "Erro ao abrir portal");
      }

      // Redirecionar para o Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal não encontrada");
      }
    } catch (error: any) {
      console.error("Erro ao abrir portal:", error);
      setError(error.message || "Erro ao abrir portal de gestão");
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <Card>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Membro Premium</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {premiumSince && <p>Membro desde {formatDate(premiumSince)}</p>}
              {premiumExpiresAt && (
                <p>
                  Renovação em{" "}
                  <span className="font-semibold">
                    {formatDate(premiumExpiresAt)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />A carregar...
              </>
            ) : (
              <>
                Gerir Subscrição
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>

          {isTestAccount && (
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                if (confirm("Desativar Premium de teste?")) {
                  try {
                    const response = await fetch(
                      "/api/debug/deactivate-premium",
                      {
                        method: "POST",
                      }
                    );

                    if (response.ok) {
                      alert("Premium desativado!");
                      window.location.reload();
                    } else {
                      alert("Erro ao desativar Premium");
                    }
                  } catch (error) {
                    alert("Erro ao desativar Premium");
                  }
                }
              }}
              className="flex items-center gap-2"
            >
              Desativar Teste
            </Button>
          )}
        </div>
      </div>

      <div
        className={`mt-4 p-4 rounded-lg border ${
          isTestAccount
            ? "bg-blue-50 border-blue-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <p
          className={`text-sm ${
            isTestAccount ? "text-blue-800" : "text-amber-800"
          }`}
        >
          {isTestAccount ? (
            <>
              🧪 <strong>Conta de Teste:</strong> Esta é uma ativação Premium de
              teste. Para uma subscrição real com gestão completa, faça um
              pagamento através do Stripe.
            </>
          ) : (
            <>
              💡 <strong>Dica:</strong> No portal de gestão pode atualizar
              método de pagamento, alterar plano, ver faturas e cancelar
              subscrição.
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
