"use client";

import { useState, useEffect } from "react";
import { X, Plus, MessageCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { ReflectionWithAuthor } from "@/types/post.types";
import { LEVELS } from "@/types/user.types";
import { getInitials, formatDate } from "@/lib/utils";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  onReflectionCreated?: () => void;
}

export function ReflectionModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  onReflectionCreated,
}: ReflectionModalProps) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [reflections, setReflections] = useState<ReflectionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [currentSource, setCurrentSource] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReflections();
    }
  }, [isOpen, postId]);

  const fetchReflections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reflections")
        .select(
          `
          *,
          author:profiles(id, full_name, username, avatar_url, current_level)
        `
        )
        .eq("post_id", postId)
        .eq("is_moderated", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReflections(data as ReflectionWithAuthor[]);
    } catch (error) {
      console.error("Error fetching reflections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = () => {
    if (currentSource.trim()) {
      setSources([...sources, currentSource.trim()]);
      setCurrentSource("");
    }
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!profile?.id) {
        throw new Error("Você precisa estar autenticado");
      }

      if (!content.trim()) {
        throw new Error("A reflexão não pode estar vazia");
      }

      // Calcular quality score básico
      let qualityScore = 0;
      if (content.length > 200) qualityScore += 10;
      if (sources.length > 0) qualityScore += 20;
      if (content.length > 500) qualityScore += 20;

      const { data, error: insertError } = await supabase
        .from("reflections")
        .insert({
          post_id: postId,
          author_id: profile.id,
          content: content.trim(),
          sources,
          quality_score: qualityScore,
          has_sources: sources.length > 0,
          is_constructive: true, // TODO: Implementar análise de sentimento
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Atualizar contagem de reflexões no post
      const { data: currentPost } = await supabase
        .from("posts")
        .select("reflection_count")
        .eq("id", postId)
        .single();

      if (currentPost) {
        await supabase
          .from("posts")
          .update({
            reflection_count: (currentPost.reflection_count || 0) + 1,
          })
          .eq("id", postId);
      }

      // Reset form
      setContent("");
      setSources([]);
      setShowForm(false);

      // Recarregar reflexões
      await fetchReflections();

      // Notificar componente pai sobre a nova reflexão
      onReflectionCreated?.();
    } catch (err: any) {
      setError(err.message || "Erro ao criar reflexão");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Reflexões</h3>
              </div>
              <p className="text-gray-600 text-sm line-clamp-1">{postTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Fechar modal"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Create Reflection Form */}
          {showForm ? (
            <form
              onSubmit={handleSubmit}
              className="bg-purple-50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Sua Reflexão</h4>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compartilhe sua reflexão fundamentada..."
                rows={5}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none mb-3 text-gray-800"
              />

              {/* Sources */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fontes e Referências (opcional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentSource}
                    onChange={(e) => setCurrentSource(e.target.value)}
                    placeholder="Ex: Aristóteles, Ética a Nicômaco"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSource();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSource}
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    Adicionar
                  </Button>
                </div>
                {sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-200"
                      >
                        {source}
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(idx)}
                          className="hover:text-purple-900"
                          title="Remover fonte"
                          aria-label="Remover fonte"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting} size="sm">
                  Publicar Reflexão
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-xl p-4 mb-6 hover:border-purple-400 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Adicionar Reflexão</span>
              </div>
            </button>
          )}

          {/* Reflections List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">A carregar reflexões...</p>
            </div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                Ainda não há reflexões sobre este conteúdo
              </p>
              <p className="text-sm text-gray-500">
                Seja o primeiro a compartilhar sua perspectiva!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.map((reflection) => {
                const authorLevel = LEVELS[
                  reflection.author.current_level || 1
                ] ||
                  LEVELS[1] || {
                    id: 1,
                    name: "Iniciante",
                    icon: "🌱",
                    color: "text-gray-500",
                    min_quality_score: 0,
                  };
                return (
                  <div
                    key={reflection.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {reflection.author.avatar_url ? (
                          <img
                            src={reflection.author.avatar_url}
                            alt={reflection.author.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(reflection.author.full_name)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {reflection.author.full_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <p
                            className={`${authorLevel.color} flex items-center gap-1`}
                          >
                            <span>{authorLevel.icon}</span>
                            {authorLevel.name}
                          </p>
                          <span className="text-gray-400">•</span>
                          <p className="text-gray-500">
                            {formatDate(reflection.created_at)}
                          </p>
                        </div>
                      </div>
                      {reflection.quality_score > 0 && (
                        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">
                          +{reflection.quality_score} pts
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                      {reflection.content}
                    </p>

                    {/* Sources */}
                    {reflection.sources && reflection.sources.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 font-semibold">
                          📚 Fontes citadas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {reflection.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
