"use client";

import { LEVELS } from "@/types/user.types";
import { Check, Lock } from "lucide-react";

interface LevelTimelineProps {
  currentLevel: number;
  qualityScore: number;
}

export function LevelTimeline({
  currentLevel,
  qualityScore,
}: LevelTimelineProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Jornada de Evolução
      </h3>

      <div className="space-y-4">
        {Object.values(LEVELS).map((level) => {
          const isCompleted = level.id < currentLevel;
          const isCurrent = level.id === currentLevel;
          const isLocked = level.id > currentLevel;

          return (
            <div key={level.id} className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500"
                    : isCurrent
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 border-purple-600"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <span className="text-2xl">{level.icon}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={`font-bold text-lg ${
                      isCurrent
                        ? level.color
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {level.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {level.min_quality_score}+ pontos
                  </span>
                </div>

                {isCompleted && (
                  <p className="text-sm text-emerald-600 font-semibold">
                    ✓ Conquistado!
                  </p>
                )}

                {isCurrent && (
                  <div className="space-y-2">
                    <p className="text-sm text-purple-600 font-semibold">
                      📍 Você está aqui ({qualityScore} pontos)
                    </p>
                    {LEVELS[level.id + 1] && (
                      <p className="text-sm text-gray-600">
                        Faltam{" "}
                        {LEVELS[level.id + 1].min_quality_score - qualityScore}{" "}
                        pontos para o próximo nível
                      </p>
                    )}
                  </div>
                )}

                {isLocked && <p className="text-sm text-gray-500">Bloqueado</p>}

                {/* Conditional descriptions */}
                <div className="mt-2 text-sm text-gray-600">
                  {level.id === 0 && (
                    <p>
                      Início da jornada. Explore conteúdos e comece a refletir.
                    </p>
                  )}
                  {level.id === 1 && (
                    <p>
                      Demonstra capacidade de reflexão básica com argumentos
                      coerentes.
                    </p>
                  )}
                  {level.id === 2 && (
                    <p>
                      Produz reflexões profundas com fontes e referências
                      consistentes.
                    </p>
                  )}
                  {level.id === 3 && (
                    <p>
                      Reflexões excepcionais que inspiram e elevam a comunidade.
                    </p>
                  )}
                  {level.id === 4 && (
                    <p>
                      Mestria em pensamento crítico e contribuições
                      transformadoras.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
