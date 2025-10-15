import { useState, useCallback } from "react";
import {
  ModerationResult,
  AudioModerationResult,
  ModerationAction,
} from "@/types/moderation";

interface UseModerationOptions {
  strictMode?: boolean;
  autoBlock?: boolean;
  onModerationComplete?: (
    result: ModerationResult | AudioModerationResult,
    action: ModerationAction
  ) => void;
}

export function useModeration(options: UseModerationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateText = useCallback(
    async (
      text: string
    ): Promise<{ result: ModerationResult; action: ModerationAction }> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/moderation/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("Erro na moderação");
        }

        const result: ModerationResult = await response.json();
        const action = determineAction(result, options);

        options.onModerationComplete?.(result, action);

        return { result, action };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const moderateAudio = useCallback(
    async (
      audioFile: File
    ): Promise<{ result: AudioModerationResult; action: ModerationAction }> => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", audioFile);

        const response = await fetch("/api/moderation/audio", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro na moderação do áudio");
        }

        const result: AudioModerationResult = await response.json();
        const action = determineAction(result, options);

        options.onModerationComplete?.(result, action);

        return { result, action };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    moderateText,
    moderateAudio,
    isLoading,
    error,
  };
}

function determineAction(
  result: ModerationResult,
  options: UseModerationOptions
): ModerationAction {
  if (!result.flagged) {
    return {
      type: "allow",
      message: "Conteúdo aprovado",
      canOverride: false,
    };
  }

  const { severity, confidence } = result;
  const { strictMode = false, autoBlock = false } = options;

  // Lógica de decisão baseada na severidade e confiança
  if (severity === "high" || (confidence > 0.8 && autoBlock)) {
    return {
      type: "block",
      message: "Conteúdo bloqueado por violar nossas diretrizes da comunidade",
      canOverride: false,
    };
  }

  if (severity === "medium" || (strictMode && severity === "low")) {
    return {
      type: "warn",
      message:
        "Este conteúdo pode ser inadequado. Tem certeza que deseja publicar?",
      canOverride: true,
    };
  }

  if (confidence > 0.5) {
    return {
      type: "review",
      message: "Conteúdo enviado para revisão manual",
      canOverride: false,
    };
  }

  return {
    type: "allow",
    message: "Conteúdo aprovado",
    canOverride: false,
  };
}
