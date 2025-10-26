/**
 * Utilitários para ambiente de produção
 */

import React from "react";

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Verifica se está em ambiente de produção
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * Verifica se deve mostrar funcionalidades de debug
 */
export const showDebugFeatures = isDevelopment;

/**
 * Log apenas em desenvolvimento
 */
export const devLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(`🔧 [DEV] ${message}`, ...args);
  }
};

/**
 * Configurações específicas por ambiente
 */
export const config = {
  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Stripe
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,

  // Moderação
  moderationStrictMode: process.env.MODERATION_STRICT_MODE === "true",
  moderationAutoBlock: process.env.MODERATION_AUTO_BLOCK === "true",

  // Features
  enableDebugPanel: isDevelopment,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
} as const;

/**
 * Wrapper para componentes que só devem aparecer em desenvolvimento
 */
export const DevOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!isDevelopment) return null;
  return <>{children}</>;
};

/**
 * Wrapper para componentes que só devem aparecer em produção
 */
export const ProdOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!isProduction) return null;
  return <>{children}</>;
};
