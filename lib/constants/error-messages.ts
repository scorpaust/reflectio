/**
 * Mensagens de erro e restrições para o sistema de permissões
 *
 * @module lib/constants/error-messages
 * @description Centraliza todas as mensagens de erro, restrições e prompts de upgrade
 */

// ============================================
// Tipos de Restrições
// ============================================

export type RestrictionType =
  | "premium_content"
  | "premium_author"
  | "connection_request"
  | "reflection_creation"
  | "content_creation"
  | "moderation_bypass"
  | "general";

export type RestrictionContext =
  | "post_view"
  | "post_creation"
  | "reflection_creation"
  | "connection_request"
  | "connection_response"
  | "content_moderation"
  | "feature_access";

// ============================================
// Mensagens de Erro por Tipo
// ============================================

/**
 * Mensagens de erro estruturadas por tipo de restrição
 */
export const ERROR_MESSAGES = {
  // Conteúdo Premium
  premium_content: {
    title: "Conteúdo Premium",
    short: "Requer subscrição Premium",
    description:
      "Este conteúdo está disponível apenas para utilizadores Premium.",
    detailed:
      "Para aceder a conteúdo premium, reflexões exclusivas e funcionalidades avançadas, faça upgrade para Premium.",
    action: "Ver Planos Premium",
    icon: "👑" as const,
  },

  // Autor Premium
  premium_author: {
    title: "Utilizador Premium",
    short: "Interação limitada",
    description:
      "Interações com utilizadores Premium são limitadas para contas gratuitas.",
    detailed:
      "Utilizadores gratuitos podem apenas visualizar posts públicos de utilizadores Premium, mas não podem criar reflexões ou interagir diretamente.",
    action: "Fazer Upgrade",
    icon: "⭐" as const,
  },

  // Solicitação de Conexão
  connection_request: {
    title: "Solicitar Conexões",
    short: "Funcionalidade Premium",
    description: "Apenas utilizadores Premium podem solicitar novas conexões.",
    detailed:
      "Com Premium, pode solicitar conexões ilimitadas, aceder a perfis detalhados e expandir a sua rede profissional.",
    action: "Desbloquear Conexões",
    icon: "🤝" as const,
  },

  // Criação de Reflexões
  reflection_creation: {
    title: "Criar Reflexões",
    short: "Acesso restrito",
    description: "Não é possível criar reflexões neste conteúdo.",
    detailed:
      "Utilizadores gratuitos podem criar reflexões apenas em posts públicos de outros utilizadores gratuitos.",
    action: "Ver Benefícios Premium",
    icon: "💭" as const,
  },

  // Criação de Conteúdo Premium
  content_creation: {
    title: "Conteúdo Premium",
    short: "Funcionalidade Premium",
    description:
      "Apenas utilizadores Premium podem marcar conteúdo como premium.",
    detailed:
      "Crie conteúdo exclusivo, monetize as suas reflexões e aceda a ferramentas avançadas de criação com Premium.",
    action: "Explorar Premium",
    icon: "✨" as const,
  },

  // Bypass de Moderação
  moderation_bypass: {
    title: "Moderação Inteligente",
    short: "Benefício Premium",
    description:
      "Utilizadores Premium têm moderação inteligente e menos restrições.",
    detailed:
      "Com Premium, o seu conteúdo é moderado de forma mais inteligente, permitindo publicação mais rápida e menos interrupções.",
    action: "Ativar Premium",
    icon: "🚀" as const,
  },

  // Geral
  general: {
    title: "Funcionalidade Premium",
    short: "Upgrade necessário",
    description:
      "Esta funcionalidade está disponível apenas para utilizadores Premium.",
    detailed:
      "Desbloqueie todas as funcionalidades, conteúdo exclusivo e uma experiência sem limitações com Premium.",
    action: "Fazer Upgrade",
    icon: "🔓" as const,
  },
} as const;

// ============================================
// Mensagens Contextuais
// ============================================

/**
 * Mensagens específicas por contexto de uso
 */
export const CONTEXTUAL_MESSAGES = {
  post_view: {
    title: "Post Premium",
    description: "Este post contém conteúdo premium exclusivo.",
    preview_text:
      "Está a ver uma prévia limitada. Faça upgrade para ver o conteúdo completo, áudio e todas as fontes.",
    cta: "Ver Conteúdo Completo",
  },

  post_creation: {
    title: "Criar Post Premium",
    description:
      "Marque o seu conteúdo como premium para monetizar e criar valor exclusivo.",
    help_text:
      "Posts premium são visíveis apenas para outros utilizadores premium e podem incluir áudio, fontes detalhadas e conteúdo expandido.",
    cta: "Ativar Funcionalidades Premium",
  },

  reflection_creation: {
    title: "Criar Reflexão",
    description: "Não é possível criar uma reflexão neste post.",
    help_text:
      "Utilizadores gratuitos podem criar reflexões apenas em posts públicos de outros utilizadores gratuitos.",
    alternative:
      "Pode visualizar reflexões existentes ou fazer upgrade para interagir sem limitações.",
    cta: "Desbloquear Reflexões",
  },

  connection_request: {
    title: "Solicitar Conexão",
    description: "Apenas utilizadores Premium podem solicitar novas conexões.",
    help_text:
      "Pode aceitar ou recusar pedidos de conexão recebidos, mas não pode iniciar novos pedidos.",
    alternative:
      "Aguarde que outros utilizadores o contactem ou faça upgrade para solicitar conexões.",
    cta: "Desbloquear Conexões",
  },

  connection_response: {
    title: "Responder a Conexão",
    description: "Pode aceitar ou recusar este pedido de conexão.",
    help_text:
      "Todos os utilizadores podem responder a pedidos de conexão recebidos.",
    cta: null, // Não precisa de upgrade
  },

  content_moderation: {
    title: "Moderação de Conteúdo",
    description: "O seu conteúdo está a ser moderado automaticamente.",
    help_text:
      "Utilizadores gratuitos têm moderação obrigatória para garantir a qualidade da plataforma.",
    alternative:
      "Utilizadores Premium têm moderação inteligente e publicação mais rápida.",
    cta: "Ativar Moderação Inteligente",
  },

  feature_access: {
    title: "Funcionalidade Restrita",
    description:
      "Esta funcionalidade está disponível apenas para utilizadores Premium.",
    help_text:
      "Faça upgrade para aceder a todas as funcionalidades da plataforma sem limitações.",
    cta: "Ver Todos os Benefícios",
  },
} as const;

// ============================================
// Tooltips e Textos de Ajuda
// ============================================

/**
 * Textos de ajuda para elementos da interface
 */
export const HELP_TEXTS = {
  // Botões e ações
  premium_content_toggle: "Marcar como conteúdo premium (apenas Premium)",
  connection_request_button: "Solicitar conexão (apenas Premium)",
  reflection_create_button:
    "Criar reflexão (limitado para utilizadores gratuitos)",
  moderation_bypass: "Moderação inteligente (benefício Premium)",

  // Indicadores de estado
  premium_badge: "Conteúdo exclusivo para utilizadores Premium",
  author_premium_badge:
    "Utilizador Premium - interações limitadas para contas gratuitas",
  locked_content: "Conteúdo bloqueado - upgrade necessário",
  limited_preview: "Prévia limitada - conteúdo completo disponível com Premium",

  // Funcionalidades
  audio_content: "Conteúdo em áudio disponível apenas para Premium",
  detailed_sources: "Fontes detalhadas disponíveis apenas para Premium",
  unlimited_reflections: "Reflexões ilimitadas com Premium",
  priority_moderation: "Moderação prioritária para utilizadores Premium",

  // Estatísticas e métricas
  premium_stats: "Estatísticas detalhadas disponíveis com Premium",
  connection_limits: "Utilizadores gratuitos podem apenas responder a conexões",
  content_limits: "Limitações de conteúdo removidas com Premium",
} as const;

// ============================================
// Links e CTAs
// ============================================

/**
 * Links contextuais para upgrade
 */
export const UPGRADE_LINKS = {
  // Páginas de destino
  pricing: "/pricing",
  premium_features: "/premium",
  comparison: "/plans",

  // Links com contexto
  from_content: "/premium?from=content",
  from_connections: "/premium?from=connections",
  from_reflections: "/premium?from=reflections",
  from_moderation: "/premium?from=moderation",
  from_general: "/premium?from=general",
} as const;

/**
 * Textos de call-to-action por contexto
 */
export const CTA_TEXTS = {
  primary: "Fazer Upgrade para Premium",
  secondary: "Ver Planos",
  tertiary: "Saber Mais",

  // Específicos por funcionalidade
  content: "Desbloquear Conteúdo",
  connections: "Desbloquear Conexões",
  reflections: "Desbloquear Reflexões",
  moderation: "Ativar Moderação Inteligente",
  features: "Ver Todas as Funcionalidades",
} as const;

// ============================================
// Utilitários
// ============================================

/**
 * Obtém a mensagem de erro apropriada para um tipo de restrição
 */
export function getErrorMessage(type: RestrictionType) {
  return ERROR_MESSAGES[type] || ERROR_MESSAGES.general;
}

/**
 * Obtém a mensagem contextual apropriada
 */
export function getContextualMessage(context: RestrictionContext) {
  return CONTEXTUAL_MESSAGES[context] || CONTEXTUAL_MESSAGES.feature_access;
}

/**
 * Obtém o link de upgrade apropriado para um contexto
 */
export function getUpgradeLink(context: RestrictionContext): string {
  switch (context) {
    case "post_view":
    case "post_creation":
      return UPGRADE_LINKS.from_content;
    case "connection_request":
    case "connection_response":
      return UPGRADE_LINKS.from_connections;
    case "reflection_creation":
      return UPGRADE_LINKS.from_reflections;
    case "content_moderation":
      return UPGRADE_LINKS.from_moderation;
    default:
      return UPGRADE_LINKS.from_general;
  }
}

/**
 * Obtém o texto de CTA apropriado para um contexto
 */
export function getCTAText(context: RestrictionContext): string {
  switch (context) {
    case "post_view":
    case "post_creation":
      return CTA_TEXTS.content;
    case "connection_request":
    case "connection_response":
      return CTA_TEXTS.connections;
    case "reflection_creation":
      return CTA_TEXTS.reflections;
    case "content_moderation":
      return CTA_TEXTS.moderation;
    default:
      return CTA_TEXTS.primary;
  }
}
