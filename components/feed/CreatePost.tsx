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
import { ModeratedTextInput } from "@/components/moderation/ModeratedTextInput";
import { ModeratedAudioInput } from "@/components/moderation/ModeratedAudioInput";
import { ContentType } from "@/types/post.types";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<ContentType>("thought");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [currentSource, setCurrentSource] = useState("");
  const [isPremiumContent, setIsPremiumContent] = useState(false);

  // Audio state
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTranscription, setAudioTranscription] = useState("");

  // Moderation state
  const [isTextValid, setIsTextValid] = useState(true);
  const [isAudioValid, setIsAudioValid] = useState(false); // Inicia como false até ter áudio válido
  const [isTitleValid, setIsTitleValid] = useState(true);

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

  const handleAudioValidated = (file: File, transcription: string) => {
    console.log("🎙️ AUDIO VALIDATED:", {
      fileName: file.name,
      fileSize: file.size,
      transcription,
      hasTranscription: !!transcription,
    });
    setAudioFile(file);
    // Garantir que sempre temos uma transcrição, mesmo que seja placeholder
    setAudioTranscription(
      transcription || "[Áudio gravado - processando transcrição...]"
    );
    console.log(
      "🎙️ Audio state updated - audioFile set, transcription:",
      transcription || "placeholder"
    );
  };

  const handleModeChange = (audioMode: boolean) => {
    console.log(`🔄 MODE CHANGE: ${audioMode ? "Audio" : "Text"}`);
    setIsAudioMode(audioMode);
    if (audioMode) {
      // Mudando para modo áudio - resetar estado de áudio
      console.log("🎙️ Resetting audio state");
      setAudioFile(null);
      setAudioTranscription("");
      setIsAudioValid(false);
    } else {
      // Mudando para modo texto - resetar estado de texto se necessário
      console.log("✍️ Switching to text mode");
      setIsTextValid(true);
    }
  };

  const handleAudioValidationChange = (isValid: boolean) => {
    console.log("🔍 AUDIO VALIDATION CHANGE:", isValid);
    setIsAudioValid(isValid);
  };

  const generateWaveform = () => {
    // Gerar waveform simulado (50 pontos)
    return Array.from({ length: 50 }, () => Math.random() * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== SUBMIT ATTEMPT ===");
    console.log("Form state:", {
      title: title.trim(),
      isTitleValid,
      isAudioMode,
      audioFile: !!audioFile,
      isAudioValid,
      content: content.trim(),
      isTextValid,
      audioTranscription,
    });

    // Validação manual antes de prosseguir
    if (isAudioMode && (!audioFile || !isAudioValid)) {
      console.log("❌ BLOCKED: Audio mode but no valid audio");
      setError("Por favor, grave um áudio válido antes de publicar.");
      setIsLoading(false);
      return;
    }

    if (!isAudioMode && (!content.trim() || !isTextValid)) {
      console.log("❌ BLOCKED: Text mode but no valid content");
      setError("Por favor, escreva um conteúdo válido antes de publicar.");
      setIsLoading(false);
      return;
    }

    if (!title.trim() || !isTitleValid) {
      console.log("❌ BLOCKED: No valid title");
      setError("Por favor, escreva um título válido antes de publicar.");
      setIsLoading(false);
      return;
    }

    console.log("✅ VALIDATION PASSED - Proceeding with post creation");

    setError("");
    setIsLoading(true);

    try {
      if (!profile?.id) {
        throw new Error("Você precisa estar autenticado");
      }

      let audioUrl = null;
      let waveform = null;
      let audioDuration = 0;

      // Se tem áudio, fazer upload primeiro
      if (audioFile) {
        console.log("Uploading audio file:", audioFile);

        // Determinar extensão baseada no tipo do arquivo
        let fileExt = "webm"; // default
        if (audioFile.type.includes("mp4")) {
          fileExt = "mp4";
        } else if (audioFile.type.includes("mpeg")) {
          fileExt = "mp3";
        } else if (audioFile.type.includes("wav")) {
          fileExt = "wav";
        } else if (audioFile.type.includes("webm")) {
          fileExt = "webm";
        }

        let fileName = `${profile.id}/audio-${Date.now()}.${fileExt}`;
        console.log("Audio file type:", audioFile.type, "Extension:", fileExt);

        // Tentar upload no bucket audio-posts, se falhar tentar avatars como fallback
        let { data: uploadData, error: uploadError } = await supabase.storage
          .from("audio-posts")
          .upload(fileName, audioFile, {
            cacheControl: "3600",
            upsert: false,
          });

        let bucketName = "audio-posts";

        // Se falhar, tentar no bucket avatars como fallback
        if (uploadError && uploadError.message.includes("Bucket not found")) {
          console.log("audio-posts bucket not found, trying avatars bucket");
          const fallbackFileName = `audio/${fileName}`;
          const uploadResult = await supabase.storage
            .from("avatars")
            .upload(fallbackFileName, audioFile, {
              cacheControl: "3600",
              upsert: false,
            });

          uploadData = uploadResult.data;
          uploadError = uploadResult.error;
          bucketName = "avatars";
          fileName = fallbackFileName;
        }

        if (uploadError) {
          console.error("Upload error:", uploadError);

          // Se o bucket não existe, tentar criar
          if (uploadError.message.includes("Bucket not found")) {
            throw new Error(
              "Bucket de áudio não configurado. Execute o script setup-audio-bucket.sql"
            );
          }

          throw new Error(`Erro no upload do áudio: ${uploadError.message}`);
        }

        console.log("Upload successful:", uploadData);

        // Tentar obter URL pública, se falhar usar URL assinada
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(fileName);

        // Verificar se a URL pública funciona, senão criar URL assinada
        let finalAudioUrl = publicUrl;
        try {
          const testResponse = await fetch(publicUrl, { method: "HEAD" });
          if (!testResponse.ok) {
            console.log("Public URL failed, creating signed URL");
            const { data: signedUrlData, error: signedError } =
              await supabase.storage
                .from(bucketName)
                .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 dias

            if (signedError) {
              console.error("Signed URL error:", signedError);
            } else {
              finalAudioUrl = signedUrlData.signedUrl;
              console.log("Using signed URL:", finalAudioUrl);
            }
          }
        } catch (error) {
          console.log("URL test failed, using original URL");
        }

        // Verificar se o arquivo existe
        const folderPath = bucketName === "avatars" ? "audio" : profile.id;
        const searchName = fileName.includes("/")
          ? fileName.split("/").pop()
          : fileName;

        const { data: fileData, error: fileError } = await supabase.storage
          .from(bucketName)
          .list(folderPath, {
            search: searchName,
          });

        if (fileError || !fileData || fileData.length === 0) {
          console.error("File verification failed:", fileError);
          throw new Error("Arquivo de áudio não foi criado corretamente");
        }

        // Calcular duração do áudio (aproximada)
        audioDuration = Math.floor(audioFile.size / 16000); // Estimativa baseada no tamanho

        audioUrl = finalAudioUrl;
        waveform = generateWaveform();
        console.log("Audio uploaded successfully:", audioUrl);
        console.log("File verified:", fileData[0]);
      }

      // Preparar conteúdo para o post
      let postContent = "";
      if (isAudioMode) {
        // Para áudio, usar transcrição se disponível, senão usar placeholder descritivo
        if (audioTranscription && audioTranscription.trim()) {
          postContent = audioTranscription.trim();
        } else {
          // Criar um placeholder mais descritivo baseado no título
          postContent = `[Conteúdo de áudio sobre: ${title.trim()}]`;
        }
      } else {
        postContent = content.trim();
      }

      // Garantir que sempre temos conteúdo não-vazio
      if (!postContent) {
        postContent = `[Post sobre: ${title.trim()}]`;
      }

      console.log("Creating post with content:", {
        isAudioMode,
        audioFile: !!audioFile,
        audioTranscription,
        postContent,
        title: title.trim(),
      });

      // Criar post
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          author_id: profile.id,
          title: title.trim(),
          content: postContent,
          type,
          sources,
          is_premium_content: isPremiumContent,
          status: "published",
          audio_url: audioUrl,
          audio_duration: audioDuration,
          audio_waveform: waveform,
          audio_transcript: audioTranscription || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Reset form
      setTitle("");
      setContent("");
      setSources([]);
      setIsPremiumContent(false);
      setIsAudioMode(false);
      setAudioFile(null);
      setAudioTranscription("");
      setIsTextValid(true);
      setIsAudioValid(false); // Reset para false até ter novo áudio válido
      setIsTitleValid(true);
      setIsOpen(false);

      onPostCreated?.();
    } catch (err: any) {
      setError(err.message || "Erro ao criar post");
    } finally {
      setIsLoading(false);
    }
  };

  // Utilizadores não-premium podem criar posts, mas não podem marcar como premium
  const canCreatePremiumContent = profile?.is_premium;

  if (!isOpen) {
    return (
      <Card>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700">
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
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar formulário de criação de post"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
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
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-800" />
                  <span className="text-xs font-medium text-gray-800">
                    {ct.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Título
          </label>
          <ModeratedTextInput
            value={title}
            onChange={setTitle}
            onValidationChange={setIsTitleValid}
            placeholder="Ex: Reflexões sobre Meditações de Marco Aurélio"
            maxLength={200}
            rows={1}
            strictMode={false}
            autoModerate={true}
            debounceMs={1500}
            className="min-h-[42px] resize-none"
          />
        </div>

        {/* Toggle entre Texto e Áudio */}
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                !isAudioMode
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              ✍️ Texto
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                isAudioMode
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              🎙️ Áudio
            </button>
          </div>

          {!isAudioMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Conteúdo
              </label>
              <ModeratedTextInput
                value={content}
                onChange={setContent}
                onValidationChange={setIsTextValid}
                placeholder="Compartilhe sua reflexão profunda..."
                rows={6}
                maxLength={5000}
                strictMode={false}
                autoModerate={true}
                debounceMs={1000}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Gravação de Áudio
              </label>
              <ModeratedAudioInput
                onAudioValidated={handleAudioValidated}
                onValidationChange={handleAudioValidationChange}
                maxDuration={600} // 10 minutos
                strictMode={false}
              />
            </div>
          )}
        </div>

        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
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
                    onClick={() => handleRemoveSource(idx)}
                    className="hover:text-purple-900"
                    aria-label={`Remover fonte: ${source}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Premium Content Toggle - apenas para utilizadores premium */}
        {canCreatePremiumContent && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPremiumContent}
              onChange={(e) => setIsPremiumContent(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-800">
              Marcar como conteúdo Premium (apenas para membros Premium)
            </span>
          </label>
        )}

        {/* Indicador de moderação */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              Moderação Automática Ativa
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Seu conteúdo é automaticamente verificado para garantir um ambiente
            respeitoso
          </p>
        </div>

        {/* Debug: Estado da validação */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
          <div className="grid grid-cols-2 gap-2 text-gray-800">
            <div>
              Título: {title.trim() ? "✅" : "❌"} (
              {isTitleValid ? "válido" : "inválido"})
            </div>
            <div>Modo: {isAudioMode ? "🎙️ Áudio" : "✍️ Texto"}</div>
            {isAudioMode ? (
              <>
                <div>Áudio: {audioFile ? "✅" : "❌"}</div>
                <div>Moderação: {isAudioValid ? "✅" : "❌"}</div>
              </>
            ) : (
              <>
                <div>Conteúdo: {content.trim() ? "✅" : "❌"}</div>
                <div>Moderação: {isTextValid ? "✅" : "❌"}</div>
              </>
            )}
          </div>
        </div>

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
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
            disabled={
              !title.trim() ||
              !isTitleValid ||
              (!isAudioMode && (!content.trim() || !isTextValid)) ||
              (isAudioMode && (!audioFile || !isAudioValid))
            }
          >
            Publicar
          </Button>
        </div>
      </form>
    </Card>
  );
}
