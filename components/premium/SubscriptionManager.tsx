"use client";

import { useState } from "react";
import { Crown, ExternalLink, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";

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
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Verificar se é uma conta de teste (sem data de expiração ou muito recente)
  const isTestAccount = Boolean(
    !premiumExpiresAt ||
      (premiumSince &&
        new Date(premiumSince) > new Date(Date.now() - 5 * 60 * 1000)) // Últimos 5 minutos
  );

  const handleManageSubscription = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Verificar se a resposta é HTML (erro 404 do Netlify)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error("API route não encontrada - resposta HTML recebida");
        setError(
          "❌ Erro de configuração do servidor. A API não está disponível. Contacte o suporte."
        );
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Erro ao fazer parse da resposta JSON:", parseError);
        setError(
          "❌ Erro de comunicação com o servidor. Tente novamente em alguns minutos."
        );
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        // Tratar diferentes tipos de erro sem lançar exceção
        if (
          data.error?.includes("teste local") ||
          data.error?.includes("subscrição")
        ) {
          setError(
            "💡 Esta é uma conta Premium de teste. Use o botão '🔗 Testar Portal' no painel de debug para testar o portal do Stripe."
          );
        } else if (data.error?.includes("autenticado")) {
          setError("❌ Erro de autenticação. Faça login novamente.");
        } else {
          setError(data.error || "❌ Erro ao abrir portal. Tente novamente.");
        }
        setIsLoading(false);
        return;
      }

      // Redirecionar para o Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("❌ URL do portal não encontrada. Tente novamente.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Erro ao abrir portal:", error);
      setError("❌ Erro de conexão. Verifique sua internet e tente novamente.");
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
          {!isTestAccount && (
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
                  Portal Stripe
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {isTestAccount ? "Desativar Teste" : "Cancelar Subscrição"}
          </Button>
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

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        premiumExpiresAt={premiumExpiresAt}
        isTestAccount={isTestAccount}
      />
    </Card>
  );
}
