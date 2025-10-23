"use client";

import { useState } from "react";
import { Crown, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRICES, PRICE_IDS } from "@/lib/stripe/client";
import { useRouter } from "next/navigation";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(
    null
  );
  const [error, setError] = useState("");

  const handleCheckout = async (
    priceId: string,
    plan: "monthly" | "yearly"
  ) => {
    try {
      setError("");
      setIsLoading(true);
      setSelectedPlan(plan);

      // Chamar API para criar sessão de checkout
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão de checkout");
      }

      // Armazenar session ID para verificação posterior
      if (data.sessionId) {
        localStorage.setItem("stripe_session_id", data.sessionId);
      }

      // Redirecionar para Stripe Checkout
      if (data.url) {
        // Mostrar mensagem de redirecionamento
        setError("🔄 Redirecionando para o pagamento seguro...");

        // Pequeno delay para mostrar a mensagem
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        throw new Error("URL de checkout não encontrada");
      }
    } catch (error: any) {
      console.error("Erro no checkout:", error);
      setError(
        error.message || "Erro ao processar pagamento. Tente novamente."
      );
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Reflectio Premium
          </h2>
          <p className="text-gray-600">
            Aprofunde sua jornada de crescimento intelectual
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Publique Seus Conteúdos
              </h3>
              <p className="text-gray-600 text-sm">
                Compartilhe suas reflexões, críticas e pensamentos com a
                comunidade
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Posts de Áudio</h3>
              <p className="text-gray-600 text-sm">
                Grave e compartilhe reflexões em formato de áudio
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Reflexões Ilimitadas
              </h3>
              <p className="text-gray-600 text-sm">
                Comente e reflita sobre todos os conteúdos da comunidade
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Acesso Prioritário
              </h3>
              <p className="text-gray-600 text-sm">
                Seja o primeiro a ver novos recursos e conteúdos exclusivos
              </p>
            </div>
          </div>
        </div>

        {/* Planos de Preços */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Plano Mensal */}
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Mensal</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">€9,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
            </div>
            <Button
              onClick={() => handleCheckout(PRICE_IDS.monthly, "monthly")}
              disabled={isLoading}
              className="w-full"
              variant={selectedPlan === "monthly" ? "primary" : "secondary"}
            >
              {isLoading && selectedPlan === "monthly" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Escolher Mensal"
              )}
            </Button>
          </div>

          {/* Plano Anual */}
          <div className="border-2 border-amber-300 rounded-xl p-6 relative bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                MAIS POPULAR
              </span>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Anual</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">€95,00</span>
                <span className="text-gray-600">/ano</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mt-1">
                Economize €23,80
              </p>
            </div>
            <Button
              onClick={() => handleCheckout(PRICE_IDS.yearly, "yearly")}
              disabled={isLoading}
              className="w-full"
              variant={selectedPlan === "yearly" ? "primary" : "primary"}
            >
              {isLoading && selectedPlan === "yearly" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Escolher Anual"
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Cancele a qualquer momento. Sem compromisso.</p>
          <p className="mt-1">Pagamento seguro processado pelo Stripe.</p>
        </div>
      </div>
    </div>
  );
}
