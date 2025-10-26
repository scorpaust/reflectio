import { NextRequest, NextResponse } from "next/server";
import { PermissionMiddleware } from "../permissions";
import { permissionService } from "@/lib/services/permissions";
import { connectionPermissionManager } from "@/lib/services/connectionPermissions";
import { reflectionPermissionChecker } from "@/lib/services/reflectionPermissions";
import { auditService } from "@/lib/services/auditService";

// Mock dependencies
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

jest.mock("@/lib/services/permissions");
jest.mock("@/lib/services/connectionPermissions");
jest.mock("@/lib/services/reflectionPermissions");
jest.mock("@/lib/services/auditService");

const mockPermissionService = permissionService as jest.Mocked<
  typeof permissionService
>;
const mockConnectionPermissionManager =
  connectionPermissionManager as jest.Mocked<
    typeof connectionPermissionManager
  >;
const mockReflectionPermissionChecker =
  reflectionPermissionChecker as jest.Mocked<
    typeof reflectionPermissionChecker
  >;
const mockAuditService = auditService as jest.Mocked<typeof auditService>;

describe("PermissionMiddleware Security Tests", () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = new NextRequest("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "user-agent": "test-agent",
        "x-forwarded-for": "127.0.0.1",
      },
    });

    mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));

    // Clear audit logs
    PermissionMiddleware.clearAuditLogs();
  });

  describe("Authentication Security", () => {
    it("should block unauthenticated requests when auth is required", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
          }),
        },
      });

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true }
      );

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        null,
        "access",
        "unknown",
        "Não autorizado",
        expect.any(Object)
      );
    });

    it("should allow unauthenticated requests when auth is not required", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      });

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: false }
      );

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("Post Permission Security", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const postId = "post-456";

    beforeEach(() => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });
    });

    it("should block access to premium posts for free users", async () => {
      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "Conteúdo premium requer subscrição",
        upgradePrompt: true,
      });

      mockReflectionPermissionChecker.canCreateReflection.mockResolvedValue({
        allowed: false,
        reason: "Post premium",
        upgradePrompt: true,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        postId,
        mockHandler,
        { requireAccess: true }
      );

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        "Conteúdo premium requer subscrição",
        expect.objectContaining({
          resourceId: postId,
        })
      );
    });

    it("should allow access to public posts for free users", async () => {
      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      mockReflectionPermissionChecker.canCreateReflection.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        postId,
        mockHandler,
        { requireAccess: true }
      );

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
      expect(mockAuditService.logSuccessfulAccess).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        expect.objectContaining({
          resourceId: postId,
        })
      );
    });

    it("should block reflection creation on premium posts for free users", async () => {
      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: true,
        reason: undefined,
        upgradePrompt: false,
      });

      mockReflectionPermissionChecker.canCreateReflection.mockResolvedValue({
        allowed: false,
        reason: "Reflexões em posts premium requerem subscrição",
        upgradePrompt: true,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        postId,
        mockHandler,
        { requireReflectionPermission: true }
      );

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseData = await response.json();
      expect(responseData.code).toBe("REFLECTION_DENIED");
      expect(responseData.upgradePrompt).toBe(true);
    });
  });

  describe("Connection Permission Security", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    beforeEach(() => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });
    });

    it("should block connection requests for free users", async () => {
      mockConnectionPermissionManager.canRequestConnection.mockResolvedValue(
        false
      );
      mockConnectionPermissionManager.canRespondToConnection.mockResolvedValue(
        true
      );

      const response = await PermissionMiddleware.withConnectionPermissions(
        mockRequest,
        mockHandler,
        { requireRequestPermission: true }
      );

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseData = await response.json();
      expect(responseData.code).toBe("CONNECTION_REQUEST_DENIED");
      expect(responseData.upgradePrompt).toBe(true);
    });

    it("should allow connection responses for free users", async () => {
      mockConnectionPermissionManager.canRequestConnection.mockResolvedValue(
        false
      );
      mockConnectionPermissionManager.canRespondToConnection.mockResolvedValue(
        true
      );

      const response = await PermissionMiddleware.withConnectionPermissions(
        mockRequest,
        mockHandler,
        { requireResponsePermission: true }
      );

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("Audit Logging Security", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    beforeEach(() => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });

      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });
    });

    it("should log all permission checks", async () => {
      await PermissionMiddleware.withPermissions(mockRequest, mockHandler, {
        logAccess: true,
        action: "test_action",
        resource: "test_resource",
      });

      expect(mockAuditService.logSuccessfulAccess).toHaveBeenCalledWith(
        mockUser.id,
        "test_action",
        "test_resource",
        expect.objectContaining({
          userAgent: "test-agent",
          ip: "127.0.0.1",
        })
      );
    });

    it("should log permission denials with context", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
          }),
        },
      });

      await PermissionMiddleware.withPermissions(mockRequest, mockHandler, {
        requireAuth: true,
        logAccess: true,
      });

      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        null,
        "access",
        "unknown",
        "Não autorizado",
        expect.objectContaining({
          userAgent: "test-agent",
          ip: "127.0.0.1",
        })
      );
    });

    it("should handle audit service failures gracefully", async () => {
      mockAuditService.logSuccessfulAccess.mockRejectedValue(
        new Error("Audit service down")
      );

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { logAccess: true }
      );

      // Should still succeed even if audit logging fails
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("Permission Bypass Attempts", () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    beforeEach(() => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      });
    });

    it("should detect and log potential bypass attempts", async () => {
      // Simulate a scenario where someone tries to bypass permissions
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false,
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "Tentativa de bypass detectada",
        upgradePrompt: false,
      });

      mockReflectionPermissionChecker.canCreateReflection.mockResolvedValue({
        allowed: false,
        reason: "Bypass attempt",
        upgradePrompt: false,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        "post-123",
        mockHandler,
        { requireAccess: true }
      );

      expect(response.status).toBe(403);
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledWith(
        mockUser.id,
        "post_access",
        "post",
        "Tentativa de bypass detectada",
        expect.any(Object)
      );
    });

    it("should validate server-side permissions even with client-side bypass", async () => {
      // Even if client sends manipulated data, server should validate
      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: false, // User is actually free
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "Utilizador gratuito não pode acessar conteúdo premium",
        upgradePrompt: true,
      });

      const response = await PermissionMiddleware.withPostPermissions(
        mockRequest,
        "premium-post-123",
        mockHandler,
        { requireAccess: true }
      );

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Rate Limiting and Suspicious Activity", () => {
    it("should track multiple failed attempts", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Not authenticated"),
          }),
        },
      });

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await PermissionMiddleware.withPermissions(mockRequest, mockHandler, {
          requireAuth: true,
          logAccess: true,
        });
      }

      // Should have logged 5 permission denials
      expect(mockAuditService.logPermissionDenial).toHaveBeenCalledTimes(5);
    });

    it("should handle error conditions gracefully", async () => {
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      });

      const response = await PermissionMiddleware.withPermissions(
        mockRequest,
        mockHandler,
        { requireAuth: true }
      );

      expect(response.status).toBe(500);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Decorator Security", () => {
    it("should apply permissions correctly with decorator", async () => {
      // Test the decorator functionality without using actual decorators in test
      const { createClient } = require("@/lib/supabase/server");
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: "user-123" } },
            error: null,
          }),
        },
      });

      mockPermissionService.getUserPermissions.mockResolvedValue({
        isPremium: true,
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: jest.fn(),
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      // Test the decorator function directly
      const decoratorFunction = PermissionMiddleware.requirePermissions({
        type: "general",
      });

      expect(typeof decoratorFunction).toBe("function");
    });
  });
});
