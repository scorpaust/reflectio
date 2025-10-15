"use client";

import {
  Book,
  Film,
  Image as ImageIcon,
  MessageCircle,
  Lock,
} from "lucide-react";
import { PostWithAuthor } from "@/types/post.types";
import { LEVELS } from "@/types/user.types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, getInitials } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

interface PostCardProps {
  post: PostWithAuthor;
  onReflect?: () => void; // Mudamos para não precisar passar parâmetros
  onUpgrade?: () => void;
}

export function PostCard({ post, onReflect, onUpgrade }: PostCardProps) {
  const { profile } = useAuth();
  const authorLevel = LEVELS[post.author.current_level || 1] ||
    LEVELS[1] || {
      id: 1,
      name: "Iniciante",
      icon: "🌱",
      color: "text-gray-500",
      min_quality_score: 0,
    };
  const canAccess = !post.is_premium_content || profile?.is_premium;

  const getTypeIcon = () => {
    switch (post.type) {
      case "book":
        return <Book className="w-5 h-5" />;
      case "film":
        return <Film className="w-5 h-5" />;
      case "photo":
        return <ImageIcon className="w-5 h-5" />;
      case "thought":
        return <MessageCircle className="w-5 h-5" />;
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
    <Card hover>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.full_name}
                className="w-full h-full rounded-full object-cover"
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
        <div className="flex items-center gap-2 text-gray-400">
          {getTypeIcon()}
          <span className="text-xs text-gray-500">{getTypeLabel()}</span>
        </div>
      </div>

      {/* Content */}
      {canAccess ? (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h3>

          <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold">
                📚 Fontes & Referências:
              </p>
              <div className="flex flex-wrap gap-2">
                {post.sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 border border-gray-200"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={onReflect}
              disabled={!profile?.is_premium}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">
                {post.reflection_count}{" "}
                {post.reflection_count === 1 ? "Reflexão" : "Reflexões"}
              </span>
            </button>

            {!profile?.is_premium && (
              <div className="flex items-center gap-2 text-gray-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs">Premium para refletir</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 mb-2">Conteúdo Premium</h4>
          <p className="text-gray-600 text-sm mb-4">
            Este conteúdo está disponível apenas para membros Premium
          </p>
          <Button onClick={onUpgrade} size="sm">
            Upgrade para Premium
          </Button>
        </div>
      )}
    </Card>
  );
}
