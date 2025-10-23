"use client";

import { useState } from "react";
import { X, AlertTriangle, Calendar, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  premiumExpiresAt: string | null;
  isTestAccount: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  premiumExpiresAt,
  isTestAccount,
}: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCancel = async () => {
    try {
      setError("");
      setSuccess("");
      setIsLoading(true);

      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar subscrição");
      }

      if (data.immediate_cancellation) {
        setSuccess(
          "✅ Subscrição cancelada! Sua conta voltou para o plano gratuito."
        );

        // Recarregar página após 2 segundos para contas de teste
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSuccess(
          `✅ Subscrição cancelada! Você continuará com acesso Premium até ${formatDate(
            data.expires_at
          )}. Não haverá mais cobranças futuras.`
        );

        // Para subscrições reais, não recarregar - apenas fechar modal após 4 segundos
        setTimeout(() => {
          onClose();
        }, 4000);
      }
    } catch (error: any) {
      console.error("Erro ao cancelar:", error);
      setError(error.message || "Erro ao cancelar subscrição");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cancelar Subscrição Premium
          </h2>
          <p className="text-gray-600">
            Tem certeza que deseja cancelar sua subscrição?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {!success && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-2">O que acontecerá:</p>
                  <ul className="space-y-1 text-xs">
                    {isTestAccount ? (
                      <li>
                        • Sua conta voltará imediatamente para o plano gratuito
                      </li>
                    ) : (
                      <>
                        <li>
                          • Você continuará com acesso Premium até{" "}
                          {premiumExpiresAt
                            ? formatDate(premiumExpiresAt)
                            : "o final do período"}
                        </li>
                        <li>
                          • Após essa data, sua conta voltará para o plano
                          gratuito
                        </li>
                        <li>• Você pode reativar a qualquer momento</li>
                      </>
                    )}
                    <li>• Não haverá mais cobranças futuras</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="danger"
                className="w-full"
              >
                {isLoading ? "Cancelando..." : "Sim, Cancelar Subscrição"}
              </Button>

              <Button
                onClick={onClose}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                Manter Subscrição
              </Button>
            </div>
          </>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Precisa de ajuda?{" "}
            <a
              href="mailto:support@reflectio.com"
              className="text-purple-600 hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
