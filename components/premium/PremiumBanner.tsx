"use client";

import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PremiumBannerProps {
  onUpgrade: () => void;
}

export function PremiumBanner({ onUpgrade }: PremiumBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                Desbloqueie Todo o Potencial
                <Sparkles className="w-5 h-5" />
              </h3>
              <p className="text-white text-opacity-90 mt-1">
                Upgrade para Premium e transforme sua jornada reflexiva
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm font-semibold">🎙️ Posts de Áudio</p>
            <p className="text-xs text-white text-opacity-80 mt-1">
              Grave reflexões
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm font-semibold">💭 Reflexões Ilimitadas</p>
            <p className="text-xs text-white text-opacity-80 mt-1">
              Sem limites
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm font-semibold">🤝 Conexões Ativas</p>
            <p className="text-xs text-white text-opacity-80 mt-1">
              Solicite convites
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm font-semibold">📚 Bibliotecas</p>
            <p className="text-xs text-white text-opacity-80 mt-1">
              Acesso completo
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onUpgrade}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
          >
            <Crown className="w-5 h-5 mr-2" />
            Tornar-me Premium
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-white border-2 border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          >
            Saber Mais
          </Button>
        </div>

        <p className="text-xs text-white text-opacity-70 mt-4">
          A partir de €7,92/mês • Cancele quando quiser
        </p>
      </div>
    </div>
  );
}
