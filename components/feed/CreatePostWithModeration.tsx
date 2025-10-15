"use client";

import { useState } from "react";
import { ModeratedTextInput } from "@/components/moderation/ModeratedTextInput";
import { ModeratedAudioInput } from "@/components/moderation/ModeratedAudioInput";
import { Send, Type, Mic } from "lucide-react";

interface CreatePostWithModerationProps {
  onPostCreated?: (
    content: string,
    audioFile?: File,
    transcription?: string
  ) => void;
  className?: string;
}

export function CreatePostWithModeration({
  onPostCreated,
  className = "",
}: CreatePostWithModerationProps) {
  const [postType, setPostType] = useState<"text" | "audio">("text");
  const [textContent, setTextContent] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTranscription, setAudioTranscription] = useState("");
  const [isTextValid, setIsTextValid] = useState(true);
  const [isAudioValid, setIsAudioValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const isValid =
      postType === "text"
        ? textContent.trim() && isTextValid
        : audioFile && isAudioValid;

    if (!isValid) {
      alert("Por favor, corrija os problemas identificados antes de publicar.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (postType === "text") {
        onPostCreated?.(textContent);
      } else {
        onPostCreated?.(audioTranscription, audioFile!, audioTranscription);
      }

      // Limpar formulário
      setTextContent("");
      setAudioFile(null);
      setAudioTranscription("");
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Erro ao criar post. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    postType === "text"
      ? textContent.trim() && isTextValid
      : audioFile && isAudioValid;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="space-y-4">
        {/* Seletor de tipo de post */}
        <div className="flex space-x-2">
          <button
            onClick={() => setPostType("text")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              postType === "text"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Texto</span>
          </button>

          <button
            onClick={() => setPostType("audio")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              postType === "audio"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Áudio</span>
          </button>
        </div>

        {/* Input baseado no tipo selecionado */}
        {postType === "text" ? (
          <ModeratedTextInput
            value={textContent}
            onChange={setTextContent}
            onValidationChange={setIsTextValid}
            placeholder="Compartilhe seus pensamentos..."
            rows={4}
            maxLength={2000}
            strictMode={false}
            autoModerate={true}
          />
        ) : (
          <ModeratedAudioInput
            onAudioValidated={(file, transcription) => {
              setAudioFile(file);
              setAudioTranscription(transcription);
            }}
            onValidationChange={setIsAudioValid}
            maxDuration={300} // 5 minutos
            strictMode={false}
          />
        )}

        {/* Botão de envio */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {postType === "text" ? (
              <span>Moderação automática ativa</span>
            ) : (
              <span>Áudio será transcrito e moderado</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              canSubmit && !isSubmitting
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Publicando..." : "Publicar"}</span>
          </button>
        </div>

        {/* Informações sobre moderação */}
        <div className="text-xs text-gray-400 border-t pt-3">
          <p>
            ✓ Conteúdo é automaticamente verificado para garantir um ambiente
            respeitoso
          </p>
          <p>
            ✓ Áudios são transcritos e analisados para detectar conteúdo
            inadequado
          </p>
          <p>✓ Você será notificado se houver problemas antes da publicação</p>
        </div>
      </div>
    </div>
  );
}
