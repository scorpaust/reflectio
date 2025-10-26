import { AuditService, auditService } from "../auditService";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

describe("AuditService Security Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Reset console methods
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Access Logging", () => {
    it("should log successful access attempts", async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await auditService.logSuccessfulAccess("user-123", "view_post", "post", {
        resourceId: "post-456",
        userAgent: "test-agent",
        ip: "127.0.0.1",
        metadata: { test: "data" },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        action: "view_post",
        resource: "post",
        resource_id: "post-456",
        allowed: true,
        reason: undefined,
        metadata: { test: "data" },
        user_agent: "test-agent",
        ip_address: "127.0.0.1",
        session_id: undefined,
        created_at: expect.any(String),
      });
    });

    it("should log permission denials with detailed context", async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await auditService.logPermissionDenial(
        "user-123",
        "access_premium_content",
        "post",
        "Utilizador gratuito não pode acessar conteúdo premium",
        {
          resourceId: "premium-post-789",
          userAgent: "test-agent",
          ip: "192.168.1.1",
          metadata: { attemptedBypass: true },
        }
      );

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        action: "access_premium_content",
        resource: "post",
        resource_id: "premium-post-789",
        allowed: false,
        reason: "Utilizador gratuito não pode acessar conteúdo premium",
        metadata: { attemptedBypass: true },
        user_agent: "test-agent",
        ip_address: "192.168.1.1",
        session_id: undefined,
        created_at: expect.any(String),
      });
    });

    it("should handle database errors gracefully", async () => {
      const mockInsert = jest
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Should not throw error
      await expect(
        auditService.logSuccessfulAccess(
          "user-123",
          "test_action",
          "test_resource"
        )
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Error logging audit entry:",
        expect.any(Error)
      );
    });
  });

  describe("Usage Metrics Tracking", () => {
    it("should create new usage metrics for new user/date", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        insert: mockInsert,
      });

      await auditService.trackUsageMetrics(
        "user-123",
        "free",
        "posts_viewed",
        1
      );

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        user_type: "free",
        date: expect.any(String),
        actions: {
          posts_viewed: 1,
          posts_created: 0,
          reflections_created: 0,
          connections_requested: 0,
          connections_responded: 0,
          premium_content_accessed: 0,
          upgrade_prompts_shown: 0,
          upgrade_prompts_clicked: 0,
        },
        created_at: expect.any(String),
      });
    });

    it("should update existing usage metrics", async () => {
      const existingMetrics = {
        id: "metrics-123",
        actions: {
          posts_viewed: 5,
          posts_created: 2,
          reflections_created: 1,
          connections_requested: 0,
          connections_responded: 3,
          premium_content_accessed: 0,
          upgrade_prompts_shown: 2,
          upgrade_prompts_clicked: 0,
        },
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: existingMetrics, error: null });
      const mockUpdate = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
      });

      await auditService.trackUsageMetrics(
        "user-123",
        "free",
        "posts_viewed",
        2
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        actions: {
          ...existingMetrics.actions,
          posts_viewed: 7, // 5 + 2
        },
        updated_at: expect.any(String),
      });
    });

    it("should handle metrics tracking errors gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(
        auditService.trackUsageMetrics("user-123", "premium", "posts_created")
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Error tracking usage metrics:",
        expect.any(Error)
      );
    });
  });

  describe("Security Alert System", () => {
    it("should create security alerts for suspicious activity", async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await auditService.createSecurityAlert({
        userId: "user-123",
        alertType: "suspicious_activity",
        severity: "high",
        description: "Multiple failed login attempts detected",
        metadata: { attemptCount: 10, timeWindow: "5 minutes" },
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-123",
        alert_type: "suspicious_activity",
        severity: "high",
        description: "Multiple failed login attempts detected",
        metadata: { attemptCount: 10, timeWindow: "5 minutes" },
        resolved: false,
        created_at: expect.any(String),
      });
    });

    it("should log critical alerts to console immediately", async () => {
      const mockInsert = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const consoleSpy = jest.spyOn(console, "error");

      await auditService.createSecurityAlert({
        userId: "user-123",
        alertType: "permission_bypass_attempt",
        severity: "critical",
        description: "Critical security breach detected",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "CRITICAL SECURITY ALERT:",
        expect.objectContaining({
          severity: "critical",
          description: "Critical security breach detected",
        })
      );
    });

    it("should handle alert creation errors gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(
        auditService.createSecurityAlert({
          userId: "user-123",
          alertType: "unusual_pattern",
          severity: "low",
          description: "Test alert",
        })
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Error creating security alert:",
        expect.any(Error)
      );
    });
  });

  describe("Suspicious Activity Detection", () => {
    it("should detect multiple failed attempts", async () => {
      // Mock recent failures query
      const recentFailures = Array(12).fill({
        user_id: "user-123",
        action: "access_premium_content",
        allowed: false,
        created_at: new Date().toISOString(),
      });

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockGte = jest.fn().mockReturnThis();
      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: recentFailures, error: null });

      mockSupabase.from.mockImplementation((table) => {
        if (table === "audit_logs") {
          return {
            select: mockSelect,
            eq: mockEq,
            gte: mockGte,
            order: mockOrder,
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      await auditService.logPermissionDenial(
        "user-123",
        "access_premium_content",
        "post",
        "Access denied"
      );

      // Should have created a security alert due to multiple failures
      expect(mockSupabase.from).toHaveBeenCalledWith("security_alerts");
    });

    it("should detect potential bypass attempts", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockGte = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockImplementation((table) => {
        if (table === "audit_logs") {
          return {
            select: mockSelect,
            eq: mockEq,
            gte: mockGte,
            order: mockOrder,
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      await auditService.logPermissionDenial(
        "user-123",
        "access_admin_panel",
        "admin",
        "Bypass attempt detected"
      );

      // Should have created a security alert for bypass attempt
      expect(mockSupabase.from).toHaveBeenCalledWith("security_alerts");
    });
  });

  describe("Data Retrieval Security", () => {
    it("should filter audit logs by user", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      await auditService.getAuditLogs({ userId: "user-123" });

      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("should handle database errors in data retrieval", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("DB Error") }),
      });

      const result = await auditService.getAuditLogs();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching audit logs:",
        expect.any(Error)
      );
    });

    it("should filter security alerts by severity", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      await auditService.getSecurityAlerts({ severity: "critical" });

      expect(mockEq).toHaveBeenCalledWith("severity", "critical");
    });
  });

  describe("Alert Resolution", () => {
    it("should resolve security alerts", async () => {
      const mockUpdate = jest
        .fn()
        .mockResolvedValue({ data: null, error: null });
      const mockEq = jest.fn().mockReturnValue({ update: mockUpdate });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      await auditService.resolveSecurityAlert("alert-123");

      expect(mockUpdate).toHaveBeenCalledWith({
        resolved: true,
        resolved_at: expect.any(String),
      });
    });

    it("should handle alert resolution errors", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error("Update failed")),
        }),
      });

      await expect(
        auditService.resolveSecurityAlert("alert-123")
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Error resolving security alert:",
        expect.any(Error)
      );
    });
  });
});
