"use client";

import { useState, useEffect, useRef } from "react";
import {
  Book,
  Film,
  Image as ImageIcon,
  MessageCircle,
  Lock,
  Trash2,
  MoreVertical,
  Crown,
} from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { PostWithAuthor } from "@/types/post.types";
import { LEVELS } from "@/types/user.types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PremiumContentPreview } from "@/components/premium/PremiumContentPreview";
import { formatDate, getInitials } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

interface PostCardProps {
  post: PostWithAuthor;
  onReflect?: () => void; // Mudamos para não precisar passar parâmetros
  onUpgrade?: () => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  onReflect,
  onUpgrade,
  onDelete,
}: PostCardProps) {
  const { profile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);
  const authorLevel = LEVELS[post.author.current_level || 1] ||
    LEVELS[1] || {
      id: 1,
      name: "Iniciante",
      icon: "🌱",
      color: "text-gray-500",
      min_quality_score: 0,
    };
  const canAccess = !post.is_premium_content || profile?.is_premium;
  const isAuthor = profile?.id === post.author_id;

  const handleDelete = async () => {
    if (!onDelete || !isAuthor) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Erro ao apagar o post. Tente novamente.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const getTypeIcon = () => {
    switch (post.type) {
      case "book":
        return <Book className="w-5 h-5 text-black" />;
      case "film":
        return <Film className="w-5 h-5 text-black" />;
      case "photo":
        return <ImageIcon className="w-5 h-5 text-black" />;
      case "thought":
        return <MessageCircle className="w-5 h-5 text-black" />;
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case "book":
        return "Livro";
      case "film":
        return "Filme";
      case "photo":
        return "Fotografia";
      case "thought":
        return "Pensamento";
    }
  };

  return (
    <>
      {canAccess ? (
        <Card hover>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(post.author.full_name)
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {post.author.full_name}
                  {post.author.username && (
                    <span className="text-gray-500 font-normal ml-1">
                      @{post.author.username}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <p className={`${authorLevel.color} flex items-center gap-1`}>
                    <span>{authorLevel.icon}</span>
                    {authorLevel.name}
                  </p>
                  <span className="text-gray-400">•</span>
                  <p className="text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-gray-800">{getTypeIcon()}</div>
              <span className="text-xs uppercase font-semibold text-gray-800">
                {getTypeLabel()}
              </span>
              {post.audio_url && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
                    🎙️ Áudio{" "}
                    {post.audio_duration &&
                      `(${Math.floor(post.audio_duration / 60)}:${(
                        post.audio_duration % 60
                      )
                        .toString()
                        .padStart(2, "0")})`}
                  </span>
                </>
              )}

              {/* Menu dropdown para o autor */}
              {isAuthor && (
                <div className="relative ml-2" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Opções do post"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Apagando..." : "Apagar post"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h3>

          {/* Se tem áudio, mostrar player */}
          {post.audio_url ? (
            <div className="mb-4">
              <AudioPlayer
                audioUrl={post.audio_url}
                waveformData={(post.audio_waveform as number[]) || undefined}
                title={post.title}
              />
            </div>
          ) : (
            /* Senão, mostrar conteúdo de texto */
            <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {/* Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-700 mb-2 font-semibold">
                📚 Fontes & Referências:
              </p>
              <div className="flex flex-wrap gap-2">
                {post.sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Premium content indicator */}
          {post.is_premium_content && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                Conteúdo Premium
              </span>
              {!profile?.is_premium && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="ml-auto text-xs bg-amber-600 text-white px-2 py-1 rounded-full hover:bg-amber-700 transition-colors"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Botão de reflexão - apenas para posts não-premium ou utilizadores premium */}
            {!post.is_premium_content || profile?.is_premium ? (
              <button
                type="button"
                onClick={onReflect}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">
                  {post.reflection_count}{" "}
                  {post.reflection_count === 1 ? "Reflexão" : "Reflexões"}
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {post.reflection_count}{" "}
                    {post.reflection_count === 1 ? "Reflexão" : "Reflexões"}
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Premium</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="text-sm bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
                >
                  Desbloquear
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Premium content preview for free users */
        <PremiumContentPreview post={post} previewLength={200} />
      )}
    </>
  );
}
