import { NextRequest, NextResponse } from "next/server";
import { PermissionMiddleware } from "@/lib/middleware/permissions";
import { auditService } from "@/lib/services/auditService";
import { permissionService } from "@/lib/services/permissions";

// Mock all dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/services/permissions");
jest.mock("@/lib/services/connectionPermissions");
jest.mock("@/lib/services/reflectionPermissions");
jest.mock("@/lib/services/auditService");

describe("Security Integration Tests", () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = new NextRequest("http://localhost:3000/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Test Browser)",
        "x-forwarded-for": "192.168.1.100",
      },
      body: JSON.stringify({ content: "test content" }),
    });

    mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));

    // Clear audit logs
    PermissionMiddleware.clearAuditLogs();
  });

  describe("End-to-End Permission Flow", () => {
    it("should handle complete free user workflow with proper logging", async () => {
      // Setup mocks for free user
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "free-user-123", email: "free@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "Conteúdo premium requer subscrição",
        upgradePrompt: true,
      });

      const mockReflectionChecker =
        require("@/lib/services/reflectionPermissions").reflectionPermissionChecker;
      mockReflectionChecker.canCreateReflection.mockResolvedValue({
        allowed: false,
        reason: "Reflexões em posts premium requerem subscrição",
        upgradePrompt: true,
      });

      // Test post access
      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        "premium-post-456",
        mockHandler,
        { requireAccess: true }
      );

      // Verify response
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      // Verify audit logging
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        "Conteúdo premium requer subscrição",
        expect.objectContaining({
          resourceId: "premium-post-456",
          userAgent: "Mozilla/5.0 (Test Browser)",
          ip: "192.168.1.100",
        })
      );

      // Verify response content
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: "Conteúdo premium requer subscrição",
        upgradePrompt: true,
        code: "POST_ACCESS_DENIED",
      });
    });

    it("should handle complete premium user workflow", async () => {
      // Setup mocks for premium user
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "premium-user-456", email: "premium@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: true,
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      const mockReflectionChecker =
        require("@/lib/services/reflectionPermissions").reflectionPermissionChecker;
      mockReflectionChecker.canCreateReflection.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      // Test post access
      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        "premium-post-789",
        mockHandler,
        { requireAccess: true, requireReflectionPermission: true }
      );

      // Verify response
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();

      // Verify audit logging
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logSuccessfulAccess).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        expect.objectContaining({
          resourceId: "premium-post-789",
          userAgent: "Mozilla/5.0 (Test Browser)",
          ip: "192.168.1.100",
        })
      );
    });
  });

  describe("Security Attack Scenarios", () => {
    it("should detect and prevent privilege escalation attempts", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "attacker-123", email: "attacker@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      // Simulate attacker trying to access admin functions
      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Simulate multiple rapid attempts to access restricted content
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        mockPermissionService.checkPostAccess.mockResolvedValue({
          allowed: false,
          reason: `Tentativa de escalação de privilégios detectada - attempt ${
            i + 1
          }`,
          upgradePrompt: false,
        });

        const response = await PermissionMiddleware.withPostPermissions(
          mockRequest,
          `admin-post-${i}`,
          mockHandler,
          { requireAccess: true }
        );

        attempts.push(response);
      }

      // All attempts should be blocked
      attempts.forEach((response) => {
        expect(response.status).toBe(403);
      });

      // Should have logged all attempts
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledTimes(5);
    });

    it("should handle SQL injection attempts in resource IDs", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "user-123", email: "user@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Malicious post ID with SQL injection attempt
      const maliciousPostId = "1'; DROP TABLE posts; --";

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "ID de post inválido detectado",
        upgradePrompt: false,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        maliciousPostId,
        mockHandler,
        { requireAccess: true }
      );

      expect(response.status).toBe(403);

      // Should log the malicious attempt
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        "ID de post inválido detectado",
        expect.objectContaining({
          resourceId: maliciousPostId,
        })
      );
    });

    it("should handle session hijacking attempts", async () => {
      const { createClient } = require("@/lib/supabase/server");

      // First request with valid user
      const validUser = { id: "valid-user-123", email: "valid@example.com" };
      createClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: validUser },
            error: null,
          }),
        },
      });

      // Second request with different user but same session (potential hijacking)
      const hijackerUser = {
        id: "hijacker-456",
        email: "hijacker@example.com",
      };
      createClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: hijackerUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions
        .mockResolvedValueOnce({
          isPremium: true,
          canViewPremiumContent: true,
          canCreatePremiumContent: true,
          canRequestConnection: true,
          requiresMandatoryModeration: false,
        })
        .mockResolvedValueOnce({
          isPremium: false,
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

      // Both requests should be handled independently
      const response1 = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true }
      );

      const response2 = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true }
      );

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Should log both accesses separately
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logSuccessfulAccess).toHaveBeenCalledTimes(2);
    });
  });

  describe("Rate Limiting and Abuse Prevention", () => {
    it("should track and log rapid successive permission denials", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "abuser-789", email: "abuser@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Simulate rapid attempts to access premium content
      const rapidAttempts = 15;
      for (let i = 0; i < rapidAttempts; i++) {
        mockPermissionService.checkPostAccess.mockResolvedValue({
          allowed: false,
          reason: "Acesso negado - conteúdo premium",
          upgradePrompt: true,
        });

        await PermissionMiddleware.withPostPermissions(
          mockRequest,
          `premium-post-${i}`,
          mockHandler,
          { requireAccess: true }
        );
      }

      // Should have logged all attempts
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledTimes(
        rapidAttempts
      );
    });

    it("should handle concurrent permission checks safely", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = {
        id: "concurrent-user-999",
        email: "concurrent@example.com",
      };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: true,
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      // Simulate concurrent requests
      const concurrentRequests = Array(10)
        .fill(null)
        .map((_, i) =>
          PermissionMiddleware.withPostPermissions(
            mockRequest,
            `post-${i}`,
            mockHandler,
            { requireAccess: true }
          )
        );

      const responses = await Promise.all(concurrentRequests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Should have logged all successful accesses
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      expect(mockAuditService.logSuccessfulAccess).toHaveBeenCalledTimes(10);
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should handle permission service failures gracefully", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "user-123", email: "user@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockRejectedValue(
        new Error("Permission service unavailable")
      );

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true }
      );

      expect(response.status).toBe(500);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should handle audit service failures without breaking main flow", async () => {
      const { createClient } = require("@/lib/supabase/server");
      const mockUser = { id: "user-123", email: "user@example.com" };

      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      const mockPermissionService =
        require("@/lib/services/permissions").permissionService;
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: true,
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      // Make audit service fail
      const mockAuditService =
        require("@/lib/services/auditService").auditService;
      mockAuditService.logSuccessfulAccess.mockRejectedValue(
        new Error("Audit service down")
      );

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true, logAccess: true }
      );

      // Main flow should still work
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it("should handle malformed requests safely", async () => {
      // Create malformed request
      const malformedRequest = new NextRequest(
        "http://localhost:3000/api/test",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: "invalid json {{{",
        }
      );

      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockRejectedValue(new Error("Invalid request")),
        },
      });

      const response = await PermissionMiddleware.withPermissions(
        malformedRequest,
        mockHandler,
        { requireAuth: true }
      );

      expect(response.status).toBe(500);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});
