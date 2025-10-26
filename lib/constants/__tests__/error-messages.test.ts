/**
 * Tests for error message constants and utilities
 */

import {
  ERROR_MESSAGES,
  CONTEXTUAL_MESSAGES,
  HELP_TEXTS,
  UPGRADE_LINKS,
  CTA_TEXTS,
  getErrorMessage,
  getContextualMessage,
  getUpgradeLink,
  getCTAText,
} from "../error-messages";

describe("Error Message Constants", () => {
  describe("ERROR_MESSAGES", () => {
    it("contains all required restriction types", () => {
      const expectedTypes = [
        "premium_content",
        "premium_author",
        "connection_request",
        "reflection_creation",
        "content_creation",
        "moderation_bypass",
        "general",
      ];

      expectedTypes.forEach((type) => {
        expect(ERROR_MESSAGES).toHaveProperty(type);
      });
    });

    it("has consistent structure for all error messages", () => {
      Object.values(ERROR_MESSAGES).forEach((message) => {
        expect(message).toHaveProperty("title");
        expect(message).toHaveProperty("short");
        expect(message).toHaveProperty("description");
        expect(message).toHaveProperty("detailed");
        expect(message).toHaveProperty("action");
        expect(message).toHaveProperty("icon");

        // Validate types
        expect(typeof message.title).toBe("string");
        expect(typeof message.short).toBe("string");
        expect(typeof message.description).toBe("string");
        expect(typeof message.detailed).toBe("string");
        expect(typeof message.action).toBe("string");
        expect(typeof message.icon).toBe("string");

        // Validate content is not empty
        expect(message.title.length).toBeGreaterThan(0);
        expect(message.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("CONTEXTUAL_MESSAGES", () => {
    it("contains all required contexts", () => {
      const expectedContexts = [
        "post_view",
        "post_creation",
        "reflection_creation",
        "connection_request",
        "connection_response",
        "content_moderation",
        "feature_access",
      ];

      expectedContexts.forEach((context) => {
        expect(CONTEXTUAL_MESSAGES).toHaveProperty(context);
      });
    });

    it("has consistent structure for contextual messages", () => {
      Object.values(CONTEXTUAL_MESSAGES).forEach((message) => {
        expect(message).toHaveProperty("title");
        expect(message).toHaveProperty("description");

        expect(typeof message.title).toBe("string");
        expect(typeof message.description).toBe("string");
        expect(message.title.length).toBeGreaterThan(0);
        expect(message.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("HELP_TEXTS", () => {
    it("contains help texts for common UI elements", () => {
      const expectedKeys = [
        "premium_content_toggle",
        "connection_request_button",
        "reflection_create_button",
        "premium_badge",
        "locked_content",
      ];

      expectedKeys.forEach((key) => {
        expect(HELP_TEXTS).toHaveProperty(key);
        expect(typeof HELP_TEXTS[key as keyof typeof HELP_TEXTS]).toBe(
          "string"
        );
      });
    });
  });

  describe("UPGRADE_LINKS", () => {
    it("contains all required upgrade links", () => {
      const expectedLinks = [
        "pricing",
        "premium_features",
        "comparison",
        "from_content",
        "from_connections",
        "from_reflections",
        "from_moderation",
        "from_general",
      ];

      expectedLinks.forEach((link) => {
        expect(UPGRADE_LINKS).toHaveProperty(link);
        expect(typeof UPGRADE_LINKS[link as keyof typeof UPGRADE_LINKS]).toBe(
          "string"
        );
        expect(UPGRADE_LINKS[link as keyof typeof UPGRADE_LINKS]).toMatch(
          /^\/\w+/
        );
      });
    });
  });

  describe("CTA_TEXTS", () => {
    it("contains all required CTA texts", () => {
      const expectedCTAs = [
        "primary",
        "secondary",
        "tertiary",
        "content",
        "connections",
        "reflections",
        "moderation",
        "features",
      ];

      expectedCTAs.forEach((cta) => {
        expect(CTA_TEXTS).toHaveProperty(cta);
        expect(typeof CTA_TEXTS[cta as keyof typeof CTA_TEXTS]).toBe("string");
        expect(CTA_TEXTS[cta as keyof typeof CTA_TEXTS].length).toBeGreaterThan(
          0
        );
      });
    });
  });
});

describe("Utility Functions", () => {
  describe("getErrorMessage", () => {
    it("returns correct error message for valid types", () => {
      const result = getErrorMessage("premium_content");
      expect(result).toBe(ERROR_MESSAGES.premium_content);
    });

    it("returns general error message for invalid types", () => {
      const result = getErrorMessage("invalid_type" as any);
      expect(result).toBe(ERROR_MESSAGES.general);
    });
  });

  describe("getContextualMessage", () => {
    it("returns correct contextual message for valid contexts", () => {
      const result = getContextualMessage("post_view");
      expect(result).toBe(CONTEXTUAL_MESSAGES.post_view);
    });

    it("returns feature_access message for invalid contexts", () => {
      const result = getContextualMessage("invalid_context" as any);
      expect(result).toBe(CONTEXTUAL_MESSAGES.feature_access);
    });
  });

  describe("getUpgradeLink", () => {
    it("returns correct upgrade link for different contexts", () => {
      expect(getUpgradeLink("post_view")).toBe(UPGRADE_LINKS.from_content);
      expect(getUpgradeLink("connection_request")).toBe(
        UPGRADE_LINKS.from_connections
      );
      expect(getUpgradeLink("reflection_creation")).toBe(
        UPGRADE_LINKS.from_reflections
      );
      expect(getUpgradeLink("content_moderation")).toBe(
        UPGRADE_LINKS.from_moderation
      );
    });

    it("returns general link for unknown contexts", () => {
      expect(getUpgradeLink("unknown_context" as any)).toBe(
        UPGRADE_LINKS.from_general
      );
    });
  });

  describe("getCTAText", () => {
    it("returns correct CTA text for different contexts", () => {
      expect(getCTAText("post_view")).toBe(CTA_TEXTS.content);
      expect(getCTAText("connection_request")).toBe(CTA_TEXTS.connections);
      expect(getCTAText("reflection_creation")).toBe(CTA_TEXTS.reflections);
      expect(getCTAText("content_moderation")).toBe(CTA_TEXTS.moderation);
    });

    it("returns primary CTA for unknown contexts", () => {
      expect(getCTAText("unknown_context" as any)).toBe(CTA_TEXTS.primary);
    });
  });
});

describe("Message Quality", () => {
  it("all error messages are in Portuguese", () => {
    Object.values(ERROR_MESSAGES).forEach((message) => {
      // Check for Portuguese words/patterns
      const portuguesePatterns = [
        /utilizador/i,
        /conteúdo/i,
        /subscrição/i,
        /premium/i,
        /fazer upgrade/i,
      ];

      const hasPortuguese = portuguesePatterns.some(
        (pattern) =>
          pattern.test(message.title) ||
          pattern.test(message.description) ||
          pattern.test(message.detailed)
      );

      expect(hasPortuguese).toBe(true);
    });
  });

  it("all contextual messages provide helpful information", () => {
    Object.values(CONTEXTUAL_MESSAGES).forEach((message) => {
      // Should have meaningful description
      expect(message.description.length).toBeGreaterThan(20);

      // Should not contain placeholder text
      expect(message.description).not.toMatch(/lorem ipsum/i);
      expect(message.description).not.toMatch(/placeholder/i);
    });
  });

  it("all upgrade links are valid paths", () => {
    Object.values(UPGRADE_LINKS).forEach((link) => {
      expect(link).toMatch(/^\/[a-z-?=]+$/);
    });
  });
});
