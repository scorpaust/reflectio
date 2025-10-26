/**
 * Hook para gerenciar erros de permissão em componentes
 *
 * @module lib/hooks/usePermissionErrors
 * @description Fornece utilitários para lidar com erros de permissão de forma consistente
 */

import { useState, useCallback } from "react";
import {
  RestrictionType,
  RestrictionContext,
  getErrorMessage,
  getContextualMessage,
  getUpgradeLink,
} from "@/lib/constants/error-messages";
import {
  ApiErrorResponse,
  isPermissionError,
  formatErrorForUser,
} from "@/lib/utils/error-responses";

export interface PermissionErrorState {
  hasError: boolean;
  errorType?: RestrictionType;
  context?: RestrictionContext;
  message?: string;
  upgradeRequired?: boolean;
  upgradeUrl?: string;
  allowedActions?: string[];
}

export interface UsePermissionErrorsReturn {
  errorState: PermissionErrorState;
  setPermissionError: (
    type: RestrictionType,
    context: RestrictionContext,
    customMessage?: string
  ) => void;
  setApiError: (error: ApiErrorResponse) => void;
  clearError: () => void;
  formatErrorMessage: () => {
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
  } | null;
}

/**
 * Hook para gerenciar estados de erro de permissão
 */
export function usePermissionErrors(): UsePermissionErrorsReturn {
  const [errorState, setErrorState] = useState<PermissionErrorState>({
    hasError: false,
  });

  /**
   * Define um erro de permissão baseado em tipo e contexto
   */
  const setPermissionError = useCallback(
    (
      type: RestrictionType,
      context: RestrictionContext,
      customMessage?: string
    ) => {
      const errorMessage = getErrorMessage(type);
      const contextualMessage = getContextualMessage(context);
      const upgradeUrl = getUpgradeLink(context);

      setErrorState({
        hasError: true,
        errorType: type,
        context,
        message: customMessage || errorMessage.description,
        upgradeRequired: true,
        upgradeUrl,
        allowedActions: [],
      });
    },
    []
  );

  /**
   * Define um erro baseado numa resposta de API
   */
  const setApiError = useCallback((error: ApiErrorResponse) => {
    if (isPermissionError(error.error)) {
      const details = error.error.details;
      setErrorState({
        hasError: true,
        errorType: details?.restriction_type || "general",
        context: details?.context || "feature_access",
        message: error.error.message,
        upgradeRequired: details?.upgrade_required || false,
        upgradeUrl: details?.upgrade_url,
        allowedActions: details?.allowed_actions || [],
      });
    } else {
      // Erro genérico
      setErrorState({
        hasError: true,
        message: error.error.message,
        upgradeRequired: false,
      });
    }
  }, []);

  /**
   * Limpa o estado de erro
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
    });
  }, []);

  /**
   * Formata a mensagem de erro para exibição
   */
  const formatErrorMessage = useCallback(() => {
    if (!errorState.hasError) return null;

    if (errorState.errorType && errorState.context) {
      const errorMessage = getErrorMessage(errorState.errorType);
      return {
        title: errorMessage.title,
        message: errorState.message || errorMessage.description,
        actionText: errorState.upgradeRequired
          ? errorMessage.action
          : undefined,
        actionUrl: errorState.upgradeUrl,
      };
    }

    return {
      title: "Erro",
      message: errorState.message || "Ocorreu um erro inesperado",
    };
  }, [errorState]);

  return {
    errorState,
    setPermissionError,
    setApiError,
    clearError,
    formatErrorMessage,
  };
}

/**
 * Hook especializado para erros de conteúdo premium
 */
export function useContentPermissionErrors() {
  const { errorState, setPermissionError, clearError, formatErrorMessage } =
    usePermissionErrors();

  const setContentAccessError = useCallback(() => {
    setPermissionError("premium_content", "post_view");
  }, [setPermissionError]);

  const setContentCreationError = useCallback(() => {
    setPermissionError("content_creation", "post_creation");
  }, [setPermissionError]);

  return {
    errorState,
    setContentAccessError,
    setContentCreationError,
    clearError,
    formatErrorMessage,
  };
}

/**
 * Hook especializado para erros de conexões
 */
export function useConnectionPermissionErrors() {
  const { errorState, setPermissionError, clearError, formatErrorMessage } =
    usePermissionErrors();

  const setConnectionRequestError = useCallback(() => {
    setPermissionError("connection_request", "connection_request");
  }, [setPermissionError]);

  const setConnectionResponseError = useCallback(() => {
    setPermissionError("connection_request", "connection_response");
  }, [setPermissionError]);

  return {
    errorState,
    setConnectionRequestError,
    setConnectionResponseError,
    clearError,
    formatErrorMessage,
  };
}

/**
 * Hook especializado para erros de reflexões
 */
export function useReflectionPermissionErrors() {
  const { errorState, setPermissionError, clearError, formatErrorMessage } =
    usePermissionErrors();

  const setReflectionCreationError = useCallback(
    (reason: "premium_content" | "premium_author") => {
      const type =
        reason === "premium_content" ? "premium_content" : "premium_author";
      setPermissionError(type, "reflection_creation");
    },
    [setPermissionError]
  );

  return {
    errorState,
    setReflectionCreationError,
    clearError,
    formatErrorMessage,
  };
}

/**
 * Hook para lidar com erros de API de forma genérica
 */
export function useApiErrorHandler() {
  const { setApiError, errorState, clearError } = usePermissionErrors();

  const handleApiError = useCallback(
    async (response: Response) => {
      if (!response.ok) {
        try {
          const errorData: ApiErrorResponse = await response.json();
          setApiError(errorData);
          return true; // Erro foi tratado
        } catch {
          // Se não conseguir parsear o JSON, define erro genérico
          setApiError({
            error: {
              code: "UNKNOWN_ERROR",
              message: `Erro ${response.status}: ${response.statusText}`,
              type: "generic",
            },
            timestamp: new Date().toISOString(),
          });
          return true;
        }
      }
      return false; // Não houve erro
    },
    [setApiError]
  );

  return {
    handleApiError,
    errorState,
    clearError,
  };
}
