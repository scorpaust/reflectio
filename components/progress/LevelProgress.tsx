"use client";

import { LEVELS } from "@/types/user.types";
import { Award, TrendingUp } from "lucide-react";

interface LevelProgressProps {
  currentLevel: number;
  qualityScore: number;
}

function getProgressWidthClass(progress: number): string {
  if (progress >= 95) return "w-full";
  if (progress >= 90) return "w-11/12";
  if (progress >= 85) return "w-5/6";
  if (progress >= 80) return "w-4/5";
  if (progress >= 75) return "w-3/4";
  if (progress >= 70) return "w-7/12";
  if (progress >= 65) return "w-3/5";
  if (progress >= 60) return "w-3/5";
  if (progress >= 55) return "w-1/2";
  if (progress >= 50) return "w-1/2";
  if (progress >= 45) return "w-2/5";
  if (progress >= 40) return "w-2/5";
  if (progress >= 35) return "w-1/3";
  if (progress >= 30) return "w-1/3";
  if (progress >= 25) return "w-1/4";
  if (progress >= 20) return "w-1/5";
  if (progress >= 15) return "w-1/6";
  if (progress >= 10) return "w-1/12";
  if (progress >= 5) return "w-1/12";
  return "w-0";
}

export function LevelProgress({
  currentLevel,
  qualityScore,
}: LevelProgressProps) {
  const current = LEVELS[currentLevel];
  const next = LEVELS[currentLevel + 1];

  const currentLevelMin = current.min_quality_score;
  const nextLevelMin = next?.min_quality_score || qualityScore;

  const progress = next
    ? ((qualityScore - currentLevelMin) / (nextLevelMin - currentLevelMin)) *
      100
    : 100;

  const pointsNeeded = next ? nextLevelMin - qualityScore : 0;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Nível Atual</p>
            <p
              className={`text-xl font-bold ${current.color} flex items-center gap-2`}
            >
              <span className="text-2xl">{current.icon}</span>
              {current.name}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600">Pontos de Qualidade</p>
          <p className="text-2xl font-bold text-gray-800">{qualityScore}</p>
        </div>
      </div>

      {next && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso para {next.name}</span>
              <span className="font-semibold text-purple-600">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 relative transition-all duration-500 ${getProgressWidthClass(
                  Math.min(progress, 100)
                )}`}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>
              Faltam <strong className="text-purple-600">{pointsNeeded}</strong>{" "}
              pontos para alcançar{" "}
              <strong className={next.color}>{next.name}</strong>
            </span>
          </div>
        </>
      )}

      {!next && (
        <div className="text-center py-4">
          <p className="text-lg font-semibold text-emerald-600">
            ✨ Você alcançou o nível máximo! ✨
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Continue compartilhando sabedoria com a comunidade
          </p>
        </div>
      )}
    </div>
  );
}
