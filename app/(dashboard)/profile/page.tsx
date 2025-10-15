"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { UserPosts } from "@/components/profile/UserPosts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LEVELS } from "@/types/user.types";
import { getInitials, formatDate } from "@/lib/utils";
import {
  Edit,
  Mail,
  Calendar,
  Award,
  BookOpen,
  MessageCircle,
  Users,
  Crown,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const supabase = createClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar perfil...</p>
        </div>
      </div>
    );
  }

  const currentLevel = LEVELS[profile.current_level || 1] ||
    LEVELS[1] || {
      id: 1,
      name: "Iniciante",
      icon: "🌱",
      color: "text-gray-500",
      min_quality_score: 0,
    };

  const handleUpdateProfile = async () => {
    // Recarregar perfil
    window.location.reload();
  };

  const handleCancelPremium = async () => {
    if (!confirm("Tem certeza que deseja cancelar o Premium?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_expires_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      window.location.reload();
    } catch (error) {
      console.error("Error canceling premium:", error);
      alert("Erro ao cancelar Premium");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto md:mx-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(profile.full_name)
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {profile.full_name}
                </h1>
                {profile.username && (
                  <p className="text-gray-500 mb-2">@{profile.username}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`${currentLevel.color} flex items-center gap-1 font-semibold text-lg`}
                  >
                    <span className="text-2xl">{currentLevel.icon}</span>
                    {currentLevel.name}
                  </span>
                  {profile.is_premium && (
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar Perfil
              </Button>
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-purple-600">
                  {profile.total_posts || 0}
                </p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-blue-600">
                  {profile.total_reflections || 0}
                </p>
                <p className="text-sm text-gray-600">Reflexões</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-emerald-600">
                  {profile.total_connections || 0}
                </p>
                <p className="text-sm text-gray-600">Conexões</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-amber-600">
                  {profile.quality_score || 0}
                </p>
                <p className="text-sm text-gray-600">Pontos</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Membro desde{" "}
                {formatDate(profile.created_at || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Premium Info */}
      {profile.is_premium && (
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Membro Premium
                </h3>
                <p className="text-sm text-gray-600">
                  {profile.premium_expires_at
                    ? `Renovação em ${formatDate(profile.premium_expires_at)}`
                    : "Assinatura ativa"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelPremium}
              disabled={isLoading}
            >
              Cancelar Premium
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso Atual</p>
              <p className="text-lg font-bold text-gray-800">
                {LEVELS[(profile.current_level || 1) + 1]
                  ? `${Math.round(
                      (((profile.quality_score || 0) -
                        currentLevel.min_quality_score) /
                        (LEVELS[(profile.current_level || 1) + 1]
                          .min_quality_score -
                          currentLevel.min_quality_score)) *
                        100
                    )}%`
                  : "Máximo"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média de Reflexões</p>
              <p className="text-lg font-bold text-gray-800">
                {(profile.total_posts || 0) > 0
                  ? (
                      (profile.total_reflections || 0) /
                      (profile.total_posts || 1)
                    ).toFixed(1)
                  : "0"}
                /post
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rank na Comunidade</p>
              <p className="text-lg font-bold text-gray-800">Top 10%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Posts Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Meus Posts</h2>
          <span className="text-sm text-gray-500">
            {profile.total_posts || 0}{" "}
            {(profile.total_posts || 0) === 1 ? "post" : "posts"} publicados
          </span>
        </div>
        <UserPosts userId={profile.id} />
      </Card>

      {/* Danger Zone */}
      <Card>
        <h3 className="text-lg font-bold text-red-600 mb-4">Zona de Perigo</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-semibold text-gray-800">Sair da Conta</p>
              <p className="text-sm text-gray-600">
                Você precisará fazer login novamente
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </Card>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
}
