"use client";

import { useState } from "react";
import {
  Book,
  Film,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ContentType } from "@/types/post.types";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { profile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<ContentType>("thought");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [currentSource, setCurrentSource] = useState("");
  const [isPremiumContent, setIsPremiumContent] = useState(false);

  const contentTypes = [
    { value: "book" as ContentType, label: "Livro", icon: Book },
    { value: "film" as ContentType, label: "Filme", icon: Film },
    { value: "photo" as ContentType, label: "Foto", icon: ImageIcon },
    {
      value: "thought" as ContentType,
      label: "Pensamento",
      icon: MessageCircle,
    },
  ];

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
    setIsLoading(true);

    try {
      console.log("🚀 Starting post creation...");

      if (!profile?.id) {
        throw new Error("Você precisa estar autenticado");
      }

      // Check content size - SEVERE limit due to Supabase RLS timeout
      const contentLength = content.trim().length;

      if (contentLength > 200) {
        throw new Error(
          `Por limitações técnicas temporárias, o máximo é 200 caracteres.\n\nPara resolver: execute o SQL em COMO_CONSERTAR_POSTS.md no Supabase Dashboard.`
        );
      }

      const supabase = createClient();

      const payload = {
        author_id: profile.id,
        title: title.trim(),
        content: content.trim(),
        type,
        sources: sources.length > 0 ? sources : null,
        is_premium_content: isPremiumContent,
        status: "published" as const,
      };

      console.log("📦 Payload size:", JSON.stringify(payload).length, "bytes");

      // Insert with 10 second timeout
      console.log("🔄 Sending to Supabase...");

      const insertPromise = supabase
        .from("posts")
        .insert(payload)
        .select();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log("⏱️ Insert timeout (10s)");
          reject(new Error("Timeout após 10 segundos"));
        }, 10000);
      });

      let data, insertError;
      try {
        const result = (await Promise.race([
          insertPromise,
          timeoutPromise,
        ])) as any;
        data = result.data;
        insertError = result.error;

        console.log("✅ Insert completed:", {
          success: !insertError,
          error: insertError?.message,
          dataReceived: !!data,
        });
      } catch (err: any) {
        console.error("⏱️ Timeout error:", err);
        throw new Error(
          "O servidor está demorando muito. Tente:\n1. Texto mais curto\n2. Sem fontes\n3. Recarregar a página"
        );
      }

      if (insertError) {
        console.error("❌ Supabase error:", insertError);
        throw new Error(insertError.message || "Erro ao criar post");
      }

      console.log("�� Post created successfully!");

      // Reset form
      setTitle("");
      setContent("");
      setSources([]);
      setIsPremiumContent(false);
      setIsOpen(false);

      // Refresh posts list
      if (onPostCreated) {
        console.log("🔄 Calling onPostCreated callback...");
        onPostCreated();
      }
    } catch (err: any) {
      console.error("❌ Error creating post:", err);
      setError(err.message || "Erro ao criar post");
    } finally {
      console.log("✅ Setting loading to false");
      setIsLoading(false);
    }
  };

  if (!profile?.is_premium) {
    return null;
  }

  if (!isOpen) {
    return (
      <Card>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500">
              Compartilhe uma reflexão cultural...
            </p>
          </div>
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Criar Conteúdo</h3>
          <button
            type="button"
            title="X"
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-xs">
          ⚠️ <strong>Limite temporário: 200 caracteres</strong>
          <br />O Supabase precisa ser configurado para aceitar posts maiores.
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Conteúdo
          </label>
          <div className="grid grid-cols-4 gap-2">
            {contentTypes.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setType(ct.value)}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                    type === ct.value
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Reflexões sobre Meditações de Marco Aurélio"
          required
          disabled={isLoading}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Conteúdo
            </label>
            <span
              className={`text-xs ${
                content.length > 200
                  ? "text-red-600 font-bold"
                  : content.length > 150
                  ? "text-orange-600"
                  : "text-gray-500"
              }`}
            >
              {content.length} / 200 (limite temporário)
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Reflexão curta (máx 200 caracteres por agora)..."
            rows={4}
            required
            disabled={isLoading}
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
            style={{ fontSize: "16px", lineHeight: "1.5" }}
          />
        </div>

        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fontes e Referências
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={currentSource}
              onChange={(e) => setCurrentSource(e.target.value)}
              placeholder="Ex: Meditações, Livro IV"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSource();
                }
              }}
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={handleAddSource}
              variant="secondary"
              disabled={isLoading}
            >
              Adicionar
            </Button>
          </div>
          {sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sources.map((source, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {source}
                  <button
                    type="button"
                    title="X"
                    onClick={() => handleRemoveSource(idx)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Premium Content Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPremiumContent}
            onChange={(e) => setIsPremiumContent(e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
            disabled={isLoading}
          />
          <span className="text-sm text-gray-700">
            Marcar como conteúdo Premium (apenas para membros Premium)
          </span>
        </label>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Publicar
          </Button>
        </div>
      </form>
    </Card>
  );
}
