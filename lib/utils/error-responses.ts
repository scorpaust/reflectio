/**
 * Utilitários para respostas de erro padronizadas em APIs
 *
 * @module lib/utils/error-responses
 * @description Centraliza a criação de respostas de erro consistentes para APIs
 */

import { NextResponse } from "next/server";
import {
  RestrictionType,
  RestrictionContext,
  getErrorMessage,
  getContextualMessage,
  getUpgradeLink,
  getCTAText,
} from "@/lib/constants/error-messages";

// ============================================
// Tipos de Resposta de Erro
// ============================================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    type: string;
    details?: {
      restriction_type?: RestrictionType;
      context?: RestrictionContext;
      upgrade_required?: boolean;
      upgrade_url?: string;
      allowed_actions?: string[];
      help_text?: string;
    };
  };
  timestamp: string;
  path?: string;
}

export interface PermissionErrorOptions {
  restrictionType: RestrictionType;
  context: RestrictionContext;
  customMessage?: string;
  allowedActions?: string[];
  includeUpgradeInfo?: boolean;
  statusCode?: number;
}

// ============================================
// Códigos de Erro Padronizados
// ============================================

export const ERROR_CODES = {
  // Permissões
  PERMISSION_DENIED: "PERMISSION_DENIED",
  PREMIUM_REQUIRED: "PREMIUM_REQUIRED",
  ACCESS_RESTRICTED: "ACCESS_RESTRICTED",

  // Conteúdo
  CONTENT_NOT_FOUND: "CONTENT_NOT_FOUND",
  CONTENT_RESTRICTED: "CONTENT_RESTRICTED",

  // Conexões
  CONNECTION_DENIED: "CONNECTION_DENIED",
  CONNECTION_LIMIT_REACHED: "CONNECTION_LIMIT_REACHED",

  // Reflexões
  REFLECTION_DENIED: "REFLECTION_DENIED",
  REFLECTION_RESTRICTED: "REFLECTION_RESTRICTED",

  // Moderação
  MODERATION_REQUIRED: "MODERATION_REQUIRED",
  CONTENT_FLAGGED: "CONTENT_FLAGGED",

  // Gerais
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// ============================================
// Funções de Criação de Respostas
// ============================================

/**
 * Cria uma resposta de erro de permissão padronizada
 */
export function createPermissionErrorResponse(
  options: PermissionErrorOptions,
  request?: Request
): NextResponse<ApiErrorResponse> {
  const {
    restrictionType,
    context,
    customMessage,
    allowedActions = [],
    includeUpgradeInfo = true,
    statusCode = 403,
  } = options;

  const errorMessage = getErrorMessage(restrictionType);
  const contextualMessage = getContextualMessage(context);

  const message = customMessage || errorMessage.description;
  const upgradeUrl = includeUpgradeInfo ? getUpgradeLink(context) : undefined;

  const errorResponse: ApiErrorResponse = {
    error: {
      code: ERROR_CODES.PERMISSION_DENIED,
      message,
      type: restrictionType,
      details: {
        restriction_type: restrictionType,
        context,
        upgrade_required: includeUpgradeInfo,
        upgrade_url: upgradeUrl,
        allowed_actions: allowedActions,
        help_text:
          "help_text" in contextualMessage
            ? contextualMessage.help_text
            : undefined,
      },
    },
    timestamp: new Date().toISOString(),
    path: request?.url,
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Cria uma resposta de erro para conteúdo premium
 */
export function createPremiumContentError(
  customMessage?: string,
  request?: Request
): NextResponse<ApiErrorResponse> {
  return createPermissionErrorResponse(
    {
      restrictionType: "premium_content",
      context: "post_view",
      customMessage,
      allowedActions: ["view_preview", "upgrade_account"],
    },
    request
  );
}

/**
 * Cria uma resposta de erro para reflexões restritas
 */
export function createReflectionRestrictedError(
  reason: "premium_content" | "premium_author",
  customMessage?: string,
  request?: Request
): NextResponse<ApiErrorResponse> {
  return createPermissionErrorResponse(
    {
      restrictionType: "reflection_creation",
      context: "reflection_creation",
      customMessage:
        customMessage ||
        (reason === "premium_content"
          ? "Não é possível criar reflexões em conteúdo premium"
          : "Não é possível criar reflexões em posts de utilizadores premium"),
      allowedActions: ["view_reflections", "upgrade_account"],
    },
    request
  );
}

/**
 * Cria uma resposta de erro para conexões restritas
 */
export function createConnectionRestrictedError(
  action: "request" | "respond",
  customMessage?: string,
  request?: Request
): NextResponse<ApiErrorResponse> {
  const allowedActions =
    action === "request"
      ? ["respond_to_connections", "upgrade_account"]
      : ["request_connections"];

  return createPermissionErrorResponse(
    {
      restrictionType: "connection_request",
      context:
        action === "request" ? "connection_request" : "connection_response",
      customMessage:
        customMessage ||
        (action === "request"
          ? "Apenas utilizadores premium podem solicitar conexões"
          : "Erro ao processar resposta de conexão"),
      allowedActions,
    },
    request
  );
}

/**
 * Cria uma resposta de erro genérica
 */
export function createGenericError(
  code: keyof typeof ERROR_CODES,
  message: string,
  statusCode: number = 400,
  request?: Request
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    error: {
      code: ERROR_CODES[code],
      message,
      type: "generic",
    },
    timestamp: new Date().toISOString(),
    path: request?.url,
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Cria uma resposta de erro de autenticação
 */
export function createAuthError(
  message: string = "Autenticação necessária",
  request?: Request
): NextResponse<ApiErrorResponse> {
  return createGenericError("UNAUTHORIZED", message, 401, request);
}

/**
 * Cria uma resposta de erro de conteúdo não encontrado
 */
export function createNotFoundError(
  resource: string = "Recurso",
  request?: Request
): NextResponse<ApiErrorResponse> {
  return createGenericError(
    "CONTENT_NOT_FOUND",
    `${resource} não encontrado`,
    404,
    request
  );
}

// ============================================
// Utilitários de Validação
// ============================================

/**
 * Verifica se um erro é de permissão
 */
export function isPermissionError(error: any): boolean {
  return (
    error?.code === ERROR_CODES.PERMISSION_DENIED ||
    error?.code === ERROR_CODES.PREMIUM_REQUIRED ||
    error?.code === ERROR_CODES.ACCESS_RESTRICTED
  );
}

/**
 * Extrai informações de upgrade de um erro
 */
export function extractUpgradeInfo(error: ApiErrorResponse): {
  required: boolean;
  url?: string;
  context?: RestrictionContext;
} {
  const details = error.error.details;
  return {
    required: details?.upgrade_required || false,
    url: details?.upgrade_url,
    context: details?.context,
  };
}

/**
 * Formata uma mensagem de erro para exibição ao utilizador
 */
export function formatErrorForUser(error: ApiErrorResponse): {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
} {
  const { error: err } = error;
  const details = err.details;

  if (isPermissionError(err)) {
    const restrictionType = details?.restriction_type || "general";
    const errorMessage = getErrorMessage(restrictionType as RestrictionType);

    return {
      title: errorMessage.title,
      message: err.message,
      actionText: details?.upgrade_required ? errorMessage.action : undefined,
      actionUrl: details?.upgrade_url,
    };
  }

  return {
    title: "Erro",
    message: err.message,
  };
}
