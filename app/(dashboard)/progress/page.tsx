"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { LevelProgress } from "@/components/progress/LevelProgress";
import { StatsCard } from "@/components/progress/StatsCard";
import { LevelTimeline } from "@/components/progress/LevelTimeline";
import { EvolutionTips } from "@/components/progress/EvolutionTips";
import { BookOpen, MessageCircle, Users, Award } from "lucide-react";

export default function ProgressPage() {
  const { profile } = useAuth();

  // Debug log para verificar os dados do profile
  console.log("Profile data:", {
    total_connections: profile?.total_connections,
    total_posts: profile?.total_posts,
    total_reflections: profile?.total_reflections,
    current_level: profile?.current_level,
    quality_score: profile?.quality_score,
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Seu Progresso Reflexivo
        </h2>
        <p className="text-gray-700">
          Acompanhe sua evolução intelectual e veja como suas reflexões impactam
          a comunidade.
        </p>
      </div>

      {/* Level Progress */}
      <LevelProgress
        currentLevel={profile.current_level || 1}
        qualityScore={profile.quality_score || 0}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={BookOpen}
          label="Posts Criados"
          value={profile.total_posts || 0}
          color="text-blue-600"
          subtitle="Conteúdos culturais compartilhados"
        />
        <StatsCard
          icon={MessageCircle}
          label="Reflexões"
          value={profile.total_reflections || 0}
          color="text-purple-600"
          subtitle="Participações em discussões"
        />
        <StatsCard
          icon={Users}
          label="Conexões"
          value={profile.total_connections || 0}
          color="text-emerald-600"
          subtitle="Pensadores conectados"
        />
        <StatsCard
          icon={Award}
          label="Pontos de Qualidade"
          value={profile.quality_score || 0}
          color="text-amber-600"
          subtitle="Score total acumulado"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - 2 columns */}
        <div className="lg:col-span-2">
          <LevelTimeline
            currentLevel={profile.current_level || 1}
            qualityScore={profile.quality_score || 0}
          />
        </div>

        {/* Tips - 1 column */}
        <div className="lg:col-span-1">
          <EvolutionTips />
        </div>
      </div>

      {/* Achievement Showcase */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Conquistas Recentes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(profile.total_posts || 0) >= 1 && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold text-blue-800">
                Primeiro Post
              </p>
              <p className="text-xs text-blue-600">Desbloqueado</p>
            </div>
          )}

          {(profile.total_reflections || 0) >= 5 && (
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">💭</div>
              <p className="text-sm font-semibold text-purple-800">
                5 Reflexões
              </p>
              <p className="text-xs text-purple-600">Desbloqueado</p>
            </div>
          )}

          {(profile.total_connections || 0) >= 1 && (
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm font-semibold text-emerald-800">
                Primeira Conexão
              </p>
              <p className="text-xs text-emerald-600">Desbloqueado</p>
            </div>
          )}

          {(profile.current_level || 1) >= 1 && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm font-semibold text-green-800">
                Nível Iniciante
              </p>
              <p className="text-xs text-green-600">Desbloqueado</p>
            </div>
          )}

          {(profile.current_level || 1) >= 2 && (
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-3xl mb-2">🌟</div>
              <p className="text-sm font-semibold text-amber-800">
                Nível Reflexivo
              </p>
              <p className="text-xs text-amber-600">Desbloqueado</p>
            </div>
          )}

          {/* Locked achievements */}
          {(profile.total_posts || 0) < 10 && (
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-gray-600">10 Posts</p>
              <p className="text-xs text-gray-500">Bloqueado</p>
            </div>
          )}

          {(profile.current_level || 1) < 2 && (
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-gray-600">Pensador</p>
              <p className="text-xs text-gray-500">Bloqueado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
