/**
 * Testes para moderação inteligente
 *
 * @description
 * Testa a funcionalidade de moderação inteligente que aplica:
 * - Moderação obrigatória para utilizadores gratuitos
 * - Moderação condicional para utilizadores premium
 * - Logs e métricas de moderação
 */

import {
  shouldModerateContent,
  logModerationDecision,
  getModerationStats,
  checkBlockedWords,
  applyCustomRules,
  combineModerationResults,
  sanitizeText,
  generateModerationReport,
  validateModerationConfig,
  IntelligentModerationConfig,
  IntelligentModerationResult,
  DEFAULT_MODERATION_CONFIG,
  OFFENSIVE_WORDS_PT,
} from "../moderation";
import {
  ModerationResult,
  CustomModerationRule,
  ModerationConfig,
} from "@/types/moderation";
import { permissionService } from "@/lib/services/permissions";

// Mock do serviço de permissões
jest.mock("@/lib/services/permissions", () => ({
  permissionService: {
    getUserPermissions: jest.fn(),
  },
}));

// Mock do console.log para testar logs
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Intelligent Moderation System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("shouldModerateContent", () => {
    const baseConfig: IntelligentModerationConfig = {
      userId: "user-123",
      contentType: "text",
      content: "Este é um texto de exemplo",
      context: {
        postId: "post-123",
      },
    };

    describe("Free Users - Mandatory Moderation", () => {
      beforeEach(() => {
        (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
          requiresMandatoryModeration: true,
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canRequestConnection: false,
        });
      });

      it("should require moderation for free users", async () => {
        const result = await shouldModerateContent(baseConfig);

        expect(result).toEqual({
          flagged: false,
          severity: "low",
          categories: [],
          reason: "Moderação obrigatória para utilizador gratuito",
          confidence: 1.0,
          moderationType: "mandatory",
          userType: "free",
          shouldModerate: true,
        });
      });

      it("should log moderation decision for free users", async () => {
        await shouldModerateContent(baseConfig);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining(
            "[Moderation Decision] User: user-123, Type: free, Content: text"
          )
        );
      });

      it("should always moderate text content for free users", async () => {
        const textConfig = { ...baseConfig, contentType: "text" as const };
        const result = await shouldModerateContent(textConfig);

        expect(result.shouldModerate).toBe(true);
        expect(result.moderationType).toBe("mandatory");
        expect(result.userType).toBe("free");
      });

      it("should always moderate audio content for free users", async () => {
        const audioConfig = { ...baseConfig, contentType: "audio" as const };
        const result = await shouldModerateContent(audioConfig);

        expect(result.shouldModerate).toBe(true);
        expect(result.moderationType).toBe("mandatory");
        expect(result.userType).toBe("free");
      });
    });

    describe("Premium Users - Intelligent Moderation", () => {
      beforeEach(() => {
        (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
          requiresMandatoryModeration: false,
          canViewPremiumContent: true,
          canCreatePremiumContent: true,
          canRequestConnection: true,
        });
      });

      it("should bypass moderation for premium users with safe content", async () => {
        const safeConfig = {
          ...baseConfig,
          content: "Esta é uma reflexão muito interessante sobre o tema.",
        };

        const result = await shouldModerateContent(safeConfig);

        expect(result.shouldModerate).toBe(false);
        expect(result.moderationType).toBe("bypassed");
        expect(result.userType).toBe("premium");
        expect(result.bypassReason).toBe(
          "Utilizador premium com conteúdo de baixo risco"
        );
      });

      it("should require moderation for premium users with offensive content", async () => {
        const riskyConfig = {
          ...baseConfig,
          content: "Você é um idiota completo e não entende nada!",
        };

        const result = await shouldModerateContent(riskyConfig);

        expect(result.shouldModerate).toBe(true);
        expect(result.moderationType).toBe("intelligent");
        expect(result.userType).toBe("premium");
        expect(result.reason).toContain("alto risco detectado");
      });

      it("should handle empty content for premium users", async () => {
        const emptyConfig = { ...baseConfig, content: "" };
        const result = await shouldModerateContent(emptyConfig);

        expect(result.shouldModerate).toBe(false);
        expect(result.moderationType).toBe("bypassed");
        expect(result.userType).toBe("premium");
      });
    });

    describe("Error Handling", () => {
      it("should apply mandatory moderation on permission service error", async () => {
        (permissionService.getUserPermissions as jest.Mock).mockRejectedValue(
          new Error("Database connection failed")
        );

        const result = await shouldModerateContent(baseConfig);

        expect(result.shouldModerate).toBe(true);
        expect(result.moderationType).toBe("mandatory");
        expect(result.userType).toBe("free");
        expect(result.reason).toContain("Erro na verificação de permissões");
      });

      it("should handle missing userId gracefully", async () => {
        const configWithoutUser = { ...baseConfig, userId: "" };

        (permissionService.getUserPermissions as jest.Mock).mockRejectedValue(
          new Error("Invalid user ID")
        );

        const result = await shouldModerateContent(configWithoutUser);

        expect(result.shouldModerate).toBe(true);
        expect(result.moderationType).toBe("mandatory");
      });
    });
  });

  describe("Utility Functions", () => {
    describe("checkBlockedWords", () => {
      it("should detect blocked words in text", () => {
        const result = checkBlockedWords(
          "Você é um idiota",
          OFFENSIVE_WORDS_PT
        );

        expect(result.hasBlockedWords).toBe(true);
        expect(result.foundWords).toContain("idiota");
      });

      it("should be case insensitive", () => {
        const result = checkBlockedWords(
          "Você é um IDIOTA",
          OFFENSIVE_WORDS_PT
        );

        expect(result.hasBlockedWords).toBe(true);
        expect(result.foundWords).toContain("idiota");
      });

      it("should return empty array for safe content", () => {
        const result = checkBlockedWords(
          "Esta é uma reflexão interessante",
          OFFENSIVE_WORDS_PT
        );

        expect(result.hasBlockedWords).toBe(false);
        expect(result.foundWords).toHaveLength(0);
      });
    });

    describe("applyCustomRules", () => {
      const customRules: CustomModerationRule[] = [
        {
          id: "1",
          name: "excessive-punctuation",
          pattern: "[!?]{3,}",
          severity: "medium",
          action: "warn",
          description: "Pontuação excessiva",
        },
        {
          id: "2",
          name: "repeated-chars",
          pattern: "(..)\\1{5,}",
          severity: "low",
          action: "warn",
          description: "Caracteres repetidos",
        },
      ];

      it("should detect custom rule violations", () => {
        const result = applyCustomRules("Que coisa!!!!", customRules);

        expect(result.triggeredRules).toHaveLength(1);
        expect(result.triggeredRules[0].name).toBe("excessive-punctuation");
        expect(result.severity).toBe("medium");
      });

      it("should detect multiple rule violations", () => {
        const result = applyCustomRules("Olaaaaaaaaaaa!!!", customRules);

        expect(result.triggeredRules.length).toBeGreaterThan(0);
        expect(result.severity).toBe("medium"); // Highest severity
      });

      it("should return empty for compliant text", () => {
        const result = applyCustomRules("Texto normal e adequado", customRules);

        expect(result.triggeredRules).toHaveLength(0);
        expect(result.severity).toBe("low");
      });
    });

    describe("combineModerationResults", () => {
      it("should combine AI and local check results", () => {
        const aiResult: ModerationResult = {
          flagged: false,
          severity: "low",
          categories: [],
          reason: "AI approved",
          confidence: 0.3,
        };

        const localChecks = {
          blockedWords: ["idiota"],
          customRules: [
            {
              id: "1",
              name: "test-rule",
              pattern: "test",
              severity: "high" as const,
              action: "block" as const,
              description: "Test rule",
            },
          ],
        };

        const result = combineModerationResults(aiResult, localChecks);

        expect(result.flagged).toBe(true);
        expect(result.severity).toBe("high");
        expect(result.categories).toContain("blocked-words");
        expect(result.categories).toContain("test-rule");
      });
    });

    describe("sanitizeText", () => {
      it("should replace blocked words with asterisks", () => {
        const config: ModerationConfig = {
          ...DEFAULT_MODERATION_CONFIG,
          blockedWords: ["idiota", "burro"],
        };

        const result = sanitizeText("Você é um idiota e burro", config);

        expect(result).toBe("Você é um ****** e *****");
      });
    });

    describe("generateModerationReport", () => {
      it("should generate comprehensive report", () => {
        const result: ModerationResult = {
          flagged: true,
          severity: "high",
          categories: ["hate", "offensive"],
          reason: "Conteúdo ofensivo detectado",
          suggestions: ["Remova linguagem ofensiva", "Use tom mais respeitoso"],
          confidence: 0.85,
        };

        const report = generateModerationReport(result);

        expect(report).toContain("Status: FLAGGED");
        expect(report).toContain("Severidade: HIGH");
        expect(report).toContain("Confiança: 85.0%");
        expect(report).toContain("Categorias: hate, offensive");
        expect(report).toContain("Motivo: Conteúdo ofensivo detectado");
        expect(report).toContain(
          "Sugestões: Remova linguagem ofensiva; Use tom mais respeitoso"
        );
      });
    });

    describe("validateModerationConfig", () => {
      it("should validate correct configuration", () => {
        const config: Partial<ModerationConfig> = {
          enableTextModeration: true,
          customRules: [
            {
              id: "1",
              name: "test",
              pattern: "test.*pattern",
              severity: "low",
              action: "warn",
              description: "Test pattern",
            },
          ],
        };

        const result = validateModerationConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect invalid regex patterns", () => {
        const config: Partial<ModerationConfig> = {
          customRules: [
            {
              id: "1",
              name: "invalid",
              pattern: "[invalid-regex",
              severity: "low",
              action: "warn",
              description: "Invalid pattern",
            },
          ],
        };

        const result = validateModerationConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Padrão regex inválido na regra "invalid"'
        );
      });
    });
  });

  describe("Moderation Logging", () => {
    it("should log moderation decisions with correct structure", () => {
      const decision: IntelligentModerationResult = {
        flagged: false,
        severity: "low",
        categories: [],
        reason: "Test reason",
        confidence: 0.9,
        moderationType: "bypassed",
        userType: "premium",
        shouldModerate: false,
        bypassReason: "Test bypass",
      };

      const config: IntelligentModerationConfig = {
        userId: "user-123",
        contentType: "text",
        content: "Test content",
        context: { postId: "post-123" },
      };

      logModerationDecision(decision, config);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^\[Moderation Log\] \{.*\}$/)
      );

      // Verificar se o log contém os campos esperados
      const logCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].includes("[Moderation Log]")
      );
      expect(logCall).toBeDefined();

      const logData = JSON.parse(logCall![0].replace("[Moderation Log] ", ""));
      expect(logData).toMatchObject({
        userId: "user-123",
        userType: "premium",
        contentType: "text",
        moderationType: "bypassed",
        shouldModerate: false,
        severity: "low",
        categories: [],
        confidence: 0.9,
        bypassReason: "Test bypass",
        context: { postId: "post-123" },
        contentLength: 12,
      });
      expect(logData.timestamp).toBeDefined();
    });

    it("should log mandatory moderation for free users", () => {
      const decision: IntelligentModerationResult = {
        flagged: false,
        severity: "low",
        categories: [],
        reason: "Moderação obrigatória",
        confidence: 1.0,
        moderationType: "mandatory",
        userType: "free",
        shouldModerate: true,
      };

      const config: IntelligentModerationConfig = {
        userId: "free-user-456",
        contentType: "audio",
        content: "Audio transcription",
      };

      logModerationDecision(decision, config);

      const logCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].includes("[Moderation Log]")
      );
      const logData = JSON.parse(logCall![0].replace("[Moderation Log] ", ""));

      expect(logData.userType).toBe("free");
      expect(logData.moderationType).toBe("mandatory");
      expect(logData.shouldModerate).toBe(true);
    });

    it("should log intelligent moderation for premium users", () => {
      const decision: IntelligentModerationResult = {
        flagged: true,
        severity: "high",
        categories: ["offensive-language"],
        reason: "Conteúdo de alto risco",
        confidence: 0.85,
        moderationType: "intelligent",
        userType: "premium",
        shouldModerate: true,
      };

      const config: IntelligentModerationConfig = {
        userId: "premium-user-789",
        contentType: "text",
        content: "Risky content",
        context: { reflectionId: "reflection-456" },
      };

      logModerationDecision(decision, config);

      const logCall = mockConsoleLog.mock.calls.find((call) =>
        call[0].includes("[Moderation Log]")
      );
      const logData = JSON.parse(logCall![0].replace("[Moderation Log] ", ""));

      expect(logData.userType).toBe("premium");
      expect(logData.moderationType).toBe("intelligent");
      expect(logData.shouldModerate).toBe(true);
      expect(logData.categories).toContain("offensive-language");
      expect(logData.context.reflectionId).toBe("reflection-456");
    });
  });

  describe("Moderation Statistics", () => {
    it("should return empty stats structure", () => {
      const stats = getModerationStats();

      expect(stats).toEqual({
        totalDecisions: 0,
        byUserType: {},
        byModerationType: {},
        averageConfidence: 0,
      });
    });

    it("should have correct structure for future implementation", () => {
      const stats = getModerationStats();

      expect(stats).toHaveProperty("totalDecisions");
      expect(stats).toHaveProperty("byUserType");
      expect(stats).toHaveProperty("byModerationType");
      expect(stats).toHaveProperty("averageConfidence");
      expect(typeof stats.totalDecisions).toBe("number");
      expect(typeof stats.byUserType).toBe("object");
      expect(typeof stats.byModerationType).toBe("object");
      expect(typeof stats.averageConfidence).toBe("number");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete flow for free user with safe content", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: true,
      });

      const config: IntelligentModerationConfig = {
        userId: "free-user-123",
        contentType: "text",
        content: "Esta é uma reflexão interessante.",
        context: { postId: "post-123" },
      };

      const result = await shouldModerateContent(config);

      expect(result.shouldModerate).toBe(true);
      expect(result.moderationType).toBe("mandatory");
      expect(result.userType).toBe("free");
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Moderation Decision] User: free-user-123, Type: free"
        )
      );
    });

    it("should handle complete flow for premium user with risky content", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: false,
      });

      const config: IntelligentModerationConfig = {
        userId: "premium-user-456",
        contentType: "text",
        content: "Você é um idiota completo!",
        context: { reflectionId: "reflection-789" },
      };

      const result = await shouldModerateContent(config);

      expect(result.shouldModerate).toBe(true);
      expect(result.moderationType).toBe("intelligent");
      expect(result.userType).toBe("premium");
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Moderation Decision] User: premium-user-456, Type: premium"
        )
      );
    });

    it("should handle complete flow for premium user with safe content", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: false,
      });

      const config: IntelligentModerationConfig = {
        userId: "premium-user-789",
        contentType: "audio",
        content: "Esta é uma reflexão muito interessante sobre o tema.",
        context: { postId: "post-456", isEdit: true },
      };

      const result = await shouldModerateContent(config);

      expect(result.shouldModerate).toBe(false);
      expect(result.moderationType).toBe("bypassed");
      expect(result.userType).toBe("premium");
      expect(result.bypassReason).toBe(
        "Utilizador premium com conteúdo de baixo risco"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Moderation Decision] User: premium-user-789, Type: premium"
        )
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: false,
      });

      const config: IntelligentModerationConfig = {
        userId: "user-123",
        contentType: "text",
        content: "",
      };

      const result = await shouldModerateContent(config);

      expect(result.shouldModerate).toBe(false);
      expect(result.moderationType).toBe("bypassed");
    });

    it("should handle very long content", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: false,
      });

      const longContent = "A".repeat(10000);
      const config: IntelligentModerationConfig = {
        userId: "user-123",
        contentType: "text",
        content: longContent,
      };

      const result = await shouldModerateContent(config);

      // Should still process without errors
      expect(result).toBeDefined();
      expect(result.userType).toBe("premium");
    });

    it("should handle special characters and emojis", async () => {
      (permissionService.getUserPermissions as jest.Mock).mockResolvedValue({
        requiresMandatoryModeration: false,
      });

      const config: IntelligentModerationConfig = {
        userId: "user-123",
        contentType: "text",
        content: "Olá! 😊 Como está? 🌟 Tudo bem? 👍",
      };

      const result = await shouldModerateContent(config);

      expect(result.shouldModerate).toBe(false);
      expect(result.moderationType).toBe("bypassed");
    });
  });
});
