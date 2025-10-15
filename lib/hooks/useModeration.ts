import { useState, useCallback } from "react";
import {
  ModerationResult,
  AudioModerationResult,
  ModerationAction,
} from "@/types/moderation";

/**
 * Opções de configuração para o hook de moderação
 */
interface UseModerationOptions {
  /** Ativa modo estrito (mais rigoroso na avaliação) */
  strictMode?: boolean;
  /** Bloqueia automaticamente conteúdo flagrado sem permitir override */
  autoBlock?: boolean;
  /** Callback executado após conclusão da moderação */
  onModerationComplete?: (
    result: ModerationResult | AudioModerationResult,
    action: ModerationAction
  ) => void;
}

/**
 * Hook customizado para moderação de conteúdo (texto e áudio)
 *
 * @description
 * Fornece funções para moderar texto e áudio usando a API do OpenAI.
 * Inclui gestão de estado de carregamento e erros.
 *
 * @example
 * ```tsx
 * const { moderateText, isLoading, error } = useModeration({
 *   strictMode: false,
 *   onModerationComplete: (result, action) => {
 *     console.log('Moderação completa:', result);
 *   }
 * });
 *
 * const handleSubmit = async (text: string) => {
 *   const { result, action } = await moderateText(text);
 *   if (action.type === 'allow') {
 *     // Publicar conteúdo
 *   }
 * };
 * ```
 *
 * @param options - Configurações do hook
 * @returns Objeto com funções de moderação e estados
 */
export function useModeration(options: UseModerationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Modera texto usando a API de moderação
   *
   * @param text - Texto a ser moderado
   * @returns Promessa com resultado da moderação e ação recomendada
   * @throws Error se a requisição falhar
   */
  const moderateText = useCallback(
    async (
      text: string
    ): Promise<{ result: ModerationResult; action: ModerationAction }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Chama API de moderação de texto
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

        // Notifica conclusão da moderação via callback
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

  /**
   * Modera áudio (transcreve e analisa o conteúdo)
   *
   * @param audioFile - Ficheiro de áudio a ser moderado
   * @returns Promessa com resultado da moderação (incluindo transcrição) e ação recomendada
   * @throws Error se a requisição ou transcrição falhar
   */
  const moderateAudio = useCallback(
    async (
      audioFile: File
    ): Promise<{ result: AudioModerationResult; action: ModerationAction }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Prepara FormData com o ficheiro de áudio
        const formData = new FormData();
        formData.append("audio", audioFile);

        // Chama API que transcreve (Whisper) e modera o conteúdo
        const response = await fetch("/api/moderation/audio", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro na moderação do áudio");
        }

        const result: AudioModerationResult = await response.json();
        const action = determineAction(result, options);

        // Notifica conclusão da moderação via callback
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

/**
 * Determina a ação a tomar baseada no resultado da moderação
 *
 * @description
 * Aplica lógica de decisão considerando:
 * - Severidade do conteúdo (low, medium, high)
 * - Nível de confiança da IA (0-1)
 * - Configurações (strictMode, autoBlock)
 *
 * Fluxo de decisão:
 * 1. Não flagrado → Permitir
 * 2. Severidade alta OU (confiança > 0.8 E autoBlock) → Bloquear
 * 3. Severidade média OU (strictMode E severidade baixa) → Avisar
 * 4. Confiança > 0.5 → Enviar para revisão
 * 5. Padrão → Permitir
 *
 * @param result - Resultado da moderação da IA
 * @param options - Configurações de moderação
 * @returns Ação recomendada (allow, warn, block, review)
 */
function determineAction(
  result: ModerationResult,
  options: UseModerationOptions
): ModerationAction {
  // Conteúdo não flagrado - aprovar imediatamente
  if (!result.flagged) {
    return {
      type: "allow",
      message: "Conteúdo aprovado",
      canOverride: false,
    };
  }

  const { severity, confidence } = result;
  const { strictMode = false, autoBlock = false } = options;

  // Severidade alta ou alta confiança com bloqueio automático - bloquear
  if (severity === "high" || (confidence > 0.8 && autoBlock)) {
    return {
      type: "block",
      message: "Conteúdo bloqueado por violar nossas diretrizes da comunidade",
      canOverride: false,
    };
  }

  // Severidade média ou modo estrito ativo - avisar mas permitir override
  if (severity === "medium" || (strictMode && severity === "low")) {
    return {
      type: "warn",
      message:
        "Este conteúdo pode ser inadequado. Tem certeza que deseja publicar?",
      canOverride: true,
    };
  }

  // Confiança moderada - enviar para revisão manual
  if (confidence > 0.5) {
    return {
      type: "review",
      message: "Conteúdo enviado para revisão manual",
      canOverride: false,
    };
  }

  // Caso padrão - aprovar
  return {
    type: "allow",
    message: "Conteúdo aprovado",
    canOverride: false,
  };
}
