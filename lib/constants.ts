/**
 * Constantes da aplicação Reflectio
 *
 * @module lib/constants
 * @description Centraliza valores constantes usados em toda a aplicação
 */

// ============================================
// Informações da Aplicação
// ============================================

/** Nome oficial da aplicação */
export const APP_NAME = "Reflectio";

/** Descrição curta da aplicação */
export const APP_DESCRIPTION =
  "Rede social para reflexão cultural e crescimento intelectual";

// ============================================
// Rotas da Aplicação
// ============================================

/**
 * Rotas disponíveis na aplicação
 *
 * @description
 * Use estas constantes em vez de strings hardcoded para:
 * - Evitar erros de digitação
 * - Facilitar refatoração de rotas
 * - Autocomplete no IDE
 *
 * @example
 * ```tsx
 * import { ROUTES } from '@/lib/constants';
 *
 * <Link href={ROUTES.FEED}>Ver Feed</Link>
 * router.push(ROUTES.LOGIN);
 * ```
 */
export const ROUTES = {
  /** Página inicial / Landing page */
  HOME: "/",
  /** Página de login */
  LOGIN: "/login",
  /** Página de registro de novos utilizadores */
  REGISTER: "/register",
  /** Feed principal de posts (requer autenticação) */
  FEED: "/feed",
  /** Página de conexões / networking (requer autenticação) */
  CONNECTIONS: "/connections",
  /** Página de progresso e estatísticas (requer autenticação) */
  PROGRESS: "/progress",
  /** Página de perfil do utilizador (requer autenticação) */
  PROFILE: "/profile",
} as const;

// ============================================
// Preços e Assinaturas
// ============================================

/**
 * Preços dos planos premium em EUR (€)
 *
 * @description
 * Valores usados na integração com Stripe
 * Atualizar aqui automaticamente reflete nos componentes
 */
export const PREMIUM_PRICES = {
  /** Assinatura mensal (€9.90/mês) */
  MONTHLY: 9.9,
  /** Assinatura anual (€95.00/ano - ~20% desconto) */
  ANNUAL: 95.0,
} as const;
