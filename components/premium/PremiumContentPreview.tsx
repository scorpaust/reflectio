"use client";

import { useState } from "react";
import {
  Crown,
  Lock,
  Eye,
  ArrowRight,
  Book,
  Film,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PremiumModal } from "./PremiumModal";
import { PostWithAuthor } from "@/types/post.types";
import { LEVELS } from "@/types/user.types";
import { formatDate, getInitials } from "@/lib/utils";

interface PremiumContentPreviewProps {
  post: PostWithAuthor;
  previewLength?: number;
  showFullPreview?: boolean;
  className?: string;
}

export function PremiumContentPreview({
  post,
  previewLength = 150,
  showFullPreview = false,
  className = "",
}: PremiumContentPreviewProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get preview text - truncate content for teaser
  const getPreviewText = () => {
    if (showFullPreview || isExpanded) {
      return post.content;
    }

    if (post.content.length <= previewLength) {
      return post.content;
    }

    return post.content.substring(0, previewLength) + "...";
  };

  // Check if content needs truncation
  const needsTruncation = post.content.length > previewLength;
  const hasAudio = !!post.audio_url;

  // Author level info
  const authorLevel = LEVELS[post.author.current_level || 1] ||
    LEVELS[1] || {
      id: 1,
      name: "Iniciante",
      icon: "🌱",
      color: "text-gray-500",
      min_quality_score: 0,
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
      <Card className={`relative overflow-hidden ${className}`}>
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
            {/* Premium Badge */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg ml-2">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="relative">
          {/* Title - always visible */}
          <h3 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h3>

          {/* Audio Preview */}
          {hasAudio && (
            <div className="mb-4 relative">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-dashed border-purple-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🎙️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Conteúdo em Áudio
                    </p>
                    <p className="text-sm text-gray-600">
                      {post.audio_duration
                        ? `${Math.floor(post.audio_duration / 60)}:${(
                            post.audio_duration % 60
                          )
                            .toString()
                            .padStart(2, "0")} minutos`
                        : "Áudio disponível"}
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>
          )}

          {/* Text Content with Blur Effect */}
          <div className="relative">
            <div
              className={`text-gray-800 leading-relaxed whitespace-pre-wrap ${
                !showFullPreview && !isExpanded ? "mb-8" : "mb-4"
              }`}
            >
              {getPreviewText()}
            </div>

            {/* Fade/Blur Overlay for truncated content */}
            {!showFullPreview && !isExpanded && needsTruncation && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Sources Preview */}
          {post.sources && post.sources.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 relative">
              <p className="text-xs text-gray-700 mb-2 font-semibold flex items-center gap-2">
                📚 Fontes & Referências
                <Lock className="w-3 h-3 text-gray-400" />
              </p>
              <div className="flex flex-wrap gap-2 opacity-60">
                {post.sources.slice(0, 2).map((source, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200"
                  >
                    {source.length > 20
                      ? source.substring(0, 20) + "..."
                      : source}
                  </span>
                ))}
                {post.sources.length > 2 && (
                  <span className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600 border border-gray-300">
                    +{post.sources.length - 2} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Controls */}
        {!showFullPreview && needsTruncation && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {isExpanded ? "Ver menos" : "Ver mais preview"}
            </button>
          </div>
        )}

        {/* Upgrade Call-to-Action */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">
                Conteúdo Premium Completo
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {hasAudio
                  ? "Aceda ao áudio completo, transcrição e todas as fontes com uma subscrição Premium."
                  : "Aceda ao conteúdo completo, todas as fontes e funcionalidades exclusivas com Premium."}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowPremiumModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Preview Stats */}
                <div className="text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Preview:{" "}
                    {Math.round((previewLength / post.content.length) * 100)}%
                    do conteúdo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection Count - Locked */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="font-medium text-sm">
              {post.reflection_count}{" "}
              {post.reflection_count === 1 ? "Reflexão" : "Reflexões"} (Premium)
            </span>
          </div>
          <Button
            onClick={() => setShowPremiumModal(true)}
            size="sm"
            variant="ghost"
            className="text-purple-600 hover:text-purple-700"
          >
            Desbloquear
          </Button>
        </div>
      </Card>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
  );
}
