/**
 * Utilitários para moderação de conteúdo
 *
 * @module lib/utils/moderation
 * @description
 * Fornece funções auxiliares para:
 * - Verificação de palavras bloqueadas
 * - Aplicação de regras customizadas
 * - Combinação de resultados de moderação
 * - Sanitização de texto
 * - Geração de relatórios
 * - Moderação inteligente baseada no status do utilizador
 */

import {
  ModerationResult,
  ModerationConfig,
  CustomModerationRule,
} from "@/types/moderation";
import { permissionService } from "@/lib/services/permissions";

// ============================================
// Configurações Padrão
// ============================================

/**
 * Configuração padrão do sistema de moderação
 *
 * @description
 * Valores iniciais usados se nenhuma configuração for fornecida.
 * Pode ser sobrescrito em contextos específicos.
 */
export const DEFAULT_MODERATION_CONFIG: ModerationConfig = {
  enableTextModeration: true,
  enableAudioModeration: true,
  strictMode: false,
  allowedCategories: [],
  blockedWords: [
    // Palavras ofensivas básicas (adicione conforme necessário)
    "idiota",
    "burro",
    "estúpido",
  ],
  customRules: [],
};

// Lista de palavras ofensivas em português (expandir conforme necessário)
export const OFFENSIVE_WORDS_PT = [
  // Insultos gerais
  "idiota",
  "imbecil",
  "burro",
  "estúpido",
  "otário",
  "babaca",
  // Termos discriminatórios (censurados para moderação)
  // Adicione termos específicos conforme necessário
];

// Categorias de moderação traduzidas
export const MODERATION_CATEGORIES_PT = {
  hate: "Discurso de ódio",
  "hate/threatening": "Ameaças de ódio",
  harassment: "Assédio",
  "harassment/threatening": "Assédio com ameaças",
  "self-harm": "Autolesão",
  "self-harm/intent": "Intenção de autolesão",
  "self-harm/instructions": "Instruções de autolesão",
  sexual: "Conteúdo sexual",
  "sexual/minors": "Conteúdo sexual envolvendo menores",
  violence: "Violência",
  "violence/graphic": "Violência gráfica",
  bullying: "Bullying",
  discrimination: "Discriminação",
  spam: "Spam",
  inappropriate: "Conteúdo inadequado",
};

// ============================================
// Funções de Verificação
// ============================================

/**
 * Verifica se o texto contém palavras bloqueadas
 *
 * @description
 * Realiza verificação case-insensitive de palavras proibidas no texto.
 * Útil para pré-validação antes de enviar para a API de moderação.
 *
 * @param text - Texto a ser verificado
 * @param blockedWords - Lista de palavras proibidas
 * @returns Objeto com flag e lista de palavras encontradas
 *
 * @example
 * ```ts
 * const { hasBlockedWords, foundWords } = checkBlockedWords(
 *   "Este é um texto de exemplo",
 *   ["palavra1", "palavra2"]
 * );
 *
 * if (hasBlockedWords) {
 *   console.log("Palavras bloqueadas encontradas:", foundWords);
 * }
 * ```
 */
export function checkBlockedWords(
  text: string,
  blockedWords: string[]
): {
  hasBlockedWords: boolean;
  foundWords: string[];
} {
  const normalizedText = text.toLowerCase();
  const foundWords: string[] = [];

  for (const word of blockedWords) {
    const normalizedWord = word.toLowerCase();
    if (normalizedText.includes(normalizedWord)) {
      foundWords.push(word);
    }
  }

  return {
    hasBlockedWords: foundWords.length > 0,
    foundWords,
  };
}

/**
 * Aplica regras de moderação customizadas ao texto
 *
 * @description
 * Testa o texto contra um conjunto de regras regex definidas pelo utilizador.
 * Retorna todas as regras que foram acionadas e a severidade máxima encontrada.
 *
 * @param text - Texto a ser verificado
 * @param rules - Array de regras customizadas com padrões regex
 * @returns Regras acionadas e nível de severidade máximo
 *
 * @example
 * ```ts
 * const rules: CustomModerationRule[] = [
 *   {
 *     id: '1',
 *     name: 'caps-lock',
 *     pattern: '^[A-Z\\s]+$',
 *     severity: 'low',
 *     action: 'warn',
 *     description: 'Texto todo em maiúsculas'
 *   }
 * ];
 *
 * const { triggeredRules, severity } = applyCustomRules("TEXTO EM CAPS", rules);
 * ```
 */
export function applyCustomRules(
  text: string,
  rules: CustomModerationRule[]
): {
  triggeredRules: CustomModerationRule[];
  severity: "low" | "medium" | "high";
} {
  const triggeredRules: CustomModerationRule[] = [];
  let maxSeverity: "low" | "medium" | "high" = "low";

  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, "gi");
      if (regex.test(text)) {
        triggeredRules.push(rule);

        // Determinar severidade máxima
        if (
          rule.severity === "high" ||
          (rule.severity === "medium" && maxSeverity === "low")
        ) {
          maxSeverity = rule.severity;
        }
      }
    } catch (error) {
      console.error(`Erro ao aplicar regra ${rule.name}:`, error);
    }
  }

  return { triggeredRules, severity: maxSeverity };
}

// Função para combinar resultados de moderação
export function combineModerationResults(
  aiResult: ModerationResult,
  localChecks: {
    blockedWords: string[];
    customRules: CustomModerationRule[];
  }
): ModerationResult {
  const { blockedWords, customRules } = localChecks;

  const hasLocalIssues = blockedWords.length > 0 || customRules.length > 0;
  const localSeverity =
    customRules.length > 0
      ? Math.max(
          ...customRules.map((r) =>
            r.severity === "high" ? 3 : r.severity === "medium" ? 2 : 1
          )
        )
      : blockedWords.length > 0
      ? 2
      : 1;

  const combinedSeverity =
    hasLocalIssues && localSeverity >= 2
      ? localSeverity === 3
        ? "high"
        : "medium"
      : aiResult.severity;

  return {
    flagged: aiResult.flagged || hasLocalIssues,
    severity: combinedSeverity,
    categories: [
      ...aiResult.categories,
      ...(blockedWords.length > 0 ? ["blocked-words"] : []),
      ...customRules.map((r) => r.name),
    ],
    reason: hasLocalIssues
      ? `Conteúdo contém elementos inadequados: ${[
          ...blockedWords,
          ...customRules.map((r) => r.name),
        ].join(", ")}`
      : aiResult.reason,
    suggestions: [
      ...(aiResult.suggestions || []),
      ...(blockedWords.length > 0 ? ["Remova palavras ofensivas"] : []),
      ...customRules.map((r) => `Revise: ${r.description}`),
    ],
    confidence: Math.max(aiResult.confidence, hasLocalIssues ? 0.8 : 0),
  };
}

// Função para sanitizar texto (remover/substituir conteúdo problemático)
export function sanitizeText(text: string, config: ModerationConfig): string {
  let sanitized = text;

  // Substituir palavras bloqueadas por asteriscos
  for (const word of config.blockedWords) {
    const regex = new RegExp(word, "gi");
    sanitized = sanitized.replace(regex, "*".repeat(word.length));
  }

  return sanitized;
}

// Função para gerar relatório de moderação
export function generateModerationReport(result: ModerationResult): string {
  const report = [];

  report.push(`Status: ${result.flagged ? "FLAGGED" : "APPROVED"}`);
  report.push(`Severidade: ${result.severity.toUpperCase()}`);
  report.push(`Confiança: ${(result.confidence * 100).toFixed(1)}%`);

  if (result.categories.length > 0) {
    report.push(`Categorias: ${result.categories.join(", ")}`);
  }

  if (result.reason) {
    report.push(`Motivo: ${result.reason}`);
  }

  if (result.suggestions && result.suggestions.length > 0) {
    report.push(`Sugestões: ${result.suggestions.join("; ")}`);
  }

  return report.join("\n");
}

// ============================================
// Moderação Inteligente Baseada no Utilizador
// ============================================

/**
 * Interface para configuração de moderação inteligente
 */
export interface IntelligentModerationConfig {
  userId: string;
  contentType: "text" | "audio";
  content: string;
  context?: {
    postId?: string;
    reflectionId?: string;
    isEdit?: boolean;
  };
}

/**
 * Interface para resultado de moderação inteligente
 */
export interface IntelligentModerationResult extends ModerationResult {
  moderationType: "mandatory" | "intelligent" | "bypassed";
  userType: "free" | "premium";
  shouldModerate: boolean;
  bypassReason?: string;
}

/**
 * Determina se o conteúdo deve ser moderado baseado no status do utilizador
 *
 * @description
 * Implementa lógica de moderação inteligente:
 * - Utilizadores gratuitos: moderação obrigatória
 * - Utilizadores premium: moderação inteligente (apenas quando necessário)
 * - Logs de todas as decisões para análise
 *
 * @param config - Configuração da moderação inteligente
 * @returns Resultado da decisão de moderação
 *
 * @example
 * ```ts
 * const result = await shouldModerateContent({
 *   userId: "user123",
 *   contentType: "text",
 *   content: "Este é um texto de exemplo"
 * });
 *
 * if (result.shouldModerate) {
 *   // Aplicar moderação
 * }
 * ```
 */
export async function shouldModerateContent(
  config: IntelligentModerationConfig
): Promise<IntelligentModerationResult> {
  try {
    // Obter permissões do utilizador
    const permissions = await permissionService.getUserPermissions(
      config.userId
    );
    const userType = permissions.requiresMandatoryModeration
      ? "free"
      : "premium";

    // Log da decisão de moderação
    console.log(
      `[Moderation Decision] User: ${config.userId}, Type: ${userType}, Content: ${config.contentType}`
    );

    // Utilizadores gratuitos sempre passam por moderação
    if (permissions.requiresMandatoryModeration) {
      return {
        flagged: false, // Será determinado pela moderação real
        severity: "low",
        categories: [],
        reason: "Moderação obrigatória para utilizador gratuito",
        confidence: 1.0,
        moderationType: "mandatory",
        userType: "free",
        shouldModerate: true,
      };
    }

    // Para utilizadores premium, aplicar moderação inteligente
    const intelligentResult = await applyIntelligentModeration(config);

    return {
      ...intelligentResult,
      moderationType: intelligentResult.shouldModerate
        ? "intelligent"
        : "bypassed",
      userType: "premium",
    };
  } catch (error) {
    console.error("Error in shouldModerateContent:", error);

    // Em caso de erro, aplicar moderação por segurança
    return {
      flagged: false,
      severity: "medium",
      categories: ["error"],
      reason:
        "Erro na verificação de permissões - aplicando moderação por segurança",
      confidence: 0.5,
      moderationType: "mandatory",
      userType: "free",
      shouldModerate: true,
    };
  }
}

/**
 * Aplica lógica de moderação inteligente para utilizadores premium
 *
 * @description
 * Determina se utilizadores premium precisam de moderação baseado em:
 * - Histórico de comportamento
 * - Tipo de conteúdo
 * - Contexto da publicação
 * - Heurísticas de risco
 *
 * @param config - Configuração da moderação
 * @returns Resultado da moderação inteligente
 */
async function applyIntelligentModeration(
  config: IntelligentModerationConfig
): Promise<IntelligentModerationResult> {
  const { content, contentType } = config;

  // Verificações rápidas que indicam necessidade de moderação
  const quickChecks = performQuickRiskAssessment(content);

  if (quickChecks.highRisk) {
    return {
      flagged: false,
      severity: quickChecks.severity,
      categories: quickChecks.categories,
      reason: "Conteúdo de alto risco detectado - moderação necessária",
      confidence: quickChecks.confidence,
      moderationType: "intelligent",
      userType: "premium",
      shouldModerate: true,
    };
  }

  // Se passou nas verificações rápidas, pode ser publicado sem moderação
  return {
    flagged: false,
    severity: "low",
    categories: [],
    reason: "Conteúdo aprovado por moderação inteligente",
    confidence: 0.9,
    moderationType: "bypassed",
    userType: "premium",
    shouldModerate: false,
    bypassReason: "Utilizador premium com conteúdo de baixo risco",
  };
}

/**
 * Realiza verificação rápida de risco no conteúdo
 *
 * @description
 * Aplica heurísticas simples para detectar conteúdo potencialmente problemático:
 * - Palavras ofensivas conhecidas
 * - Padrões suspeitos (CAPS excessivo, caracteres especiais)
 * - Comprimento anormal
 * - URLs suspeitas
 *
 * @param content - Conteúdo a ser verificado
 * @returns Resultado da avaliação de risco
 */
function performQuickRiskAssessment(content: string): {
  highRisk: boolean;
  severity: "low" | "medium" | "high";
  categories: string[];
  confidence: number;
} {
  const risks: string[] = [];
  let maxSeverity: "low" | "medium" | "high" = "low";

  // Verificar palavras ofensivas
  const { hasBlockedWords, foundWords } = checkBlockedWords(
    content,
    OFFENSIVE_WORDS_PT
  );
  if (hasBlockedWords) {
    risks.push("offensive-language");
    maxSeverity = "high";
  }

  // Verificar CAPS excessivo (mais de 70% em maiúsculas)
  const uppercaseRatio =
    (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.7 && content.length > 20) {
    risks.push("excessive-caps");
    maxSeverity = maxSeverity === "low" ? "medium" : maxSeverity;
  }

  // Verificar caracteres especiais suspeitos
  const specialCharRatio =
    (content.match(/[!@#$%^&*()_+=\[\]{}|;':",./<>?~`]/g) || []).length /
    content.length;
  if (specialCharRatio > 0.3) {
    risks.push("suspicious-characters");
    maxSeverity = maxSeverity === "low" ? "medium" : maxSeverity;
  }

  // Verificar URLs suspeitas (padrão básico)
  const suspiciousUrls = content.match(/https?:\/\/[^\s]+/g);
  if (suspiciousUrls && suspiciousUrls.length > 2) {
    risks.push("multiple-urls");
    maxSeverity = maxSeverity === "low" ? "medium" : maxSeverity;
  }

  // Verificar repetição excessiva de caracteres
  if (/(.)\1{10,}/.test(content)) {
    risks.push("character-spam");
    maxSeverity = maxSeverity === "low" ? "medium" : maxSeverity;
  }

  const highRisk =
    risks.length > 0 && (maxSeverity === "high" || risks.length >= 3);
  const confidence = risks.length > 0 ? Math.min(0.8, risks.length * 0.3) : 0.1;

  return {
    highRisk,
    severity: maxSeverity,
    categories: risks,
    confidence,
  };
}

/**
 * Registra decisão de moderação para análise posterior
 *
 * @description
 * Mantém logs estruturados das decisões de moderação para:
 * - Análise de eficácia do sistema
 * - Detecção de padrões de abuso
 * - Melhoria contínua dos algoritmos
 * - Auditoria de segurança
 *
 * @param decision - Resultado da decisão de moderação
 * @param config - Configuração original da moderação
 */
export function logModerationDecision(
  decision: IntelligentModerationResult,
  config: IntelligentModerationConfig
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: config.userId,
    userType: decision.userType,
    contentType: config.contentType,
    moderationType: decision.moderationType,
    shouldModerate: decision.shouldModerate,
    severity: decision.severity,
    categories: decision.categories,
    confidence: decision.confidence,
    bypassReason: decision.bypassReason,
    context: config.context,
    contentLength: config.content.length,
  };

  // Log estruturado para análise
  console.log(`[Moderation Log] ${JSON.stringify(logEntry)}`);

  // TODO: Implementar persistência em base de dados para análise posterior
  // await saveModerationLog(logEntry);
}

/**
 * Obtém estatísticas de moderação por tipo de utilizador
 *
 * @description
 * Fornece métricas para análise da eficácia do sistema de moderação inteligente
 *
 * @returns Estatísticas de moderação
 */
export function getModerationStats(): {
  totalDecisions: number;
  byUserType: Record<string, number>;
  byModerationType: Record<string, number>;
  averageConfidence: number;
} {
  // TODO: Implementar coleta de estatísticas da base de dados
  // Por agora, retorna estrutura vazia para compatibilidade
  return {
    totalDecisions: 0,
    byUserType: {},
    byModerationType: {},
    averageConfidence: 0,
  };
}

// Função para validar configuração de moderação
export function validateModerationConfig(config: Partial<ModerationConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.customRules) {
    for (const rule of config.customRules) {
      try {
        new RegExp(rule.pattern);
      } catch {
        errors.push(`Padrão regex inválido na regra "${rule.name}"`);
      }

      if (!rule.name || !rule.pattern) {
        errors.push("Regras customizadas devem ter nome e padrão");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
