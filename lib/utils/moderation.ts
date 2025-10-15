import {
  ModerationResult,
  ModerationConfig,
  CustomModerationRule,
} from "@/types/moderation";

// Configuração padrão de moderação
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

// Função para verificar palavras bloqueadas localmente
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

// Função para aplicar regras customizadas
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
