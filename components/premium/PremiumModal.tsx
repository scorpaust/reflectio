"use client";

import { Crown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PREMIUM_PRICES } from "@/lib/constants";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          title="X"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              <h3 className="font-semibold text-gray-800">Solicite Conexões</h3>
              <p className="text-gray-600 text-sm">
                Conecte-se ativamente com pensadores do seu nível ou inferior
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Acesso às Bibliotecas
              </h3>
              <p className="text-gray-600 text-sm">
                Explore toda a biblioteca pessoal das suas conexões enquanto for
                Premium
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Crie Reflexões Ilimitadas
              </h3>
              <p className="text-gray-600 text-sm">
                Participe ativamente das discussões e evolua seu nível
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Ferramentas Avançadas
              </h3>
              <p className="text-gray-600 text-sm">
                Estatísticas de crescimento e insights sobre suas reflexões
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-colors cursor-pointer">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Mensal</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                €{PREMIUM_PRICES.MONTHLY.toFixed(2)}
              </p>
              <p className="text-gray-500 text-xs mb-4">por mês</p>
              <Button className="w-full">Escolher Mensal</Button>
            </div>
          </div>

          <div className="border-2 border-amber-400 rounded-xl p-6 bg-amber-50 relative hover:border-amber-500 transition-colors cursor-pointer">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              Poupe 20%
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Anual</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                €{PREMIUM_PRICES.ANNUAL.toFixed(2)}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                €{(PREMIUM_PRICES.ANNUAL / 12).toFixed(2)}/mês
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600">
                Escolher Anual
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Cancele a qualquer momento. Todos os pagamentos são seguros.
        </p>
      </div>
    </div>
  );
}
