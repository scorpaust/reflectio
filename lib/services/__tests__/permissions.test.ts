/// <reference types="jest" />
import { UserProfile } from "@/types/user.types";

// Mock Supabase client before importing PermissionService
jest.mock("@/lib/supabase/client");

import { PermissionService } from "../permissions";
import { createClient } from "@/lib/supabase/client";

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("PermissionService", () => {
  let permissionService: PermissionService;
  let mockSupabaseInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase instance with proper chaining
    mockSupabaseInstance = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockCreateClient.mockReturnValue(mockSupabaseInstance);
    permissionService = new PermissionService();
  });

  describe("getUserPermissions", () => {
    it("should return premium permissions for active premium user", async () => {
      const mockProfile: UserProfile = {
        id: "user-1",
        email: "test@example.com",
        full_name: "Test User",
        username: "testuser",
        avatar_url: null,
        bio: null,
        current_level: 1,
        quality_score: 100,
        is_premium: true,
        premium_since: "2024-01-01",
        premium_expires_at: "2025-01-01", // Future date
        total_posts: 0,
        total_reflections: 0,
        total_connections: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };

      // Mock the complete chain: from().select().eq().single()
      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const permissions = await permissionService.getUserPermissions("user-1");

      expect(permissions.canViewPremiumContent).toBe(true);
      expect(permissions.canCreatePremiumContent).toBe(true);
      expect(permissions.canRequestConnection).toBe(true);
      expect(permissions.requiresMandatoryModeration).toBe(false);
      expect(
        permissions.canCreateReflectionOnPost("post-1", false, false)
      ).toBe(true);
      expect(permissions.canCreateReflectionOnPost("post-1", true, true)).toBe(
        true
      );
    });

    it("should return free permissions for non-premium user", async () => {
      const mockProfile: UserProfile = {
        id: "user-2",
        email: "free@example.com",
        full_name: "Free User",
        username: "freeuser",
        avatar_url: null,
        bio: null,
        current_level: 1,
        quality_score: 50,
        is_premium: false,
        premium_since: null,
        premium_expires_at: null,
        total_posts: 0,
        total_reflections: 0,
        total_connections: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const permissions = await permissionService.getUserPermissions("user-2");

      expect(permissions.canViewPremiumContent).toBe(false);
      expect(permissions.canCreatePremiumContent).toBe(false);
      expect(permissions.canRequestConnection).toBe(false);
      expect(permissions.requiresMandatoryModeration).toBe(true);

      // Free users can only reflect on public posts from other free users
      expect(
        permissions.canCreateReflectionOnPost("post-1", false, false)
      ).toBe(true);
      expect(permissions.canCreateReflectionOnPost("post-1", true, false)).toBe(
        false
      );
      expect(permissions.canCreateReflectionOnPost("post-1", false, true)).toBe(
        false
      );
    });

    it("should return free permissions for expired premium user", async () => {
      const mockProfile: UserProfile = {
        id: "user-3",
        email: "expired@example.com",
        full_name: "Expired User",
        username: "expireduser",
        avatar_url: null,
        bio: null,
        current_level: 2,
        quality_score: 200,
        is_premium: true,
        premium_since: "2023-01-01",
        premium_expires_at: "2023-12-31", // Past date
        total_posts: 5,
        total_reflections: 10,
        total_connections: 3,
        created_at: "2023-01-01",
        updated_at: "2024-01-01",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const permissions = await permissionService.getUserPermissions("user-3");

      expect(permissions.canViewPremiumContent).toBe(false);
      expect(permissions.canCreatePremiumContent).toBe(false);
      expect(permissions.canRequestConnection).toBe(false);
      expect(permissions.requiresMandatoryModeration).toBe(true);
    });

    it("should return free permissions when profile fetch fails", async () => {
      mockSupabaseInstance.single.mockResolvedValue({
        data: null,
        error: { message: "Profile not found" },
      });

      const permissions = await permissionService.getUserPermissions(
        "nonexistent-user"
      );

      expect(permissions.canViewPremiumContent).toBe(false);
      expect(permissions.canCreatePremiumContent).toBe(false);
      expect(permissions.canRequestConnection).toBe(false);
      expect(permissions.requiresMandatoryModeration).toBe(true);
    });

    it("should handle premium user with no expiration date", async () => {
      const mockProfile: UserProfile = {
        id: "user-4",
        email: "lifetime@example.com",
        full_name: "Lifetime User",
        username: "lifetimeuser",
        avatar_url: null,
        bio: null,
        current_level: 3,
        quality_score: 500,
        is_premium: true,
        premium_since: "2024-01-01",
        premium_expires_at: null, // No expiration
        total_posts: 10,
        total_reflections: 20,
        total_connections: 15,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const permissions = await permissionService.getUserPermissions("user-4");

      expect(permissions.canViewPremiumContent).toBe(true);
      expect(permissions.canCreatePremiumContent).toBe(true);
      expect(permissions.canRequestConnection).toBe(true);
      expect(permissions.requiresMandatoryModeration).toBe(false);
    });
  });

  describe("checkPostAccess", () => {
    it("should allow access to public posts for any user", async () => {
      const mockPost = {
        is_premium_content: false,
        author_id: "author-1",
      };

      mockSupabaseInstance.single
        .mockResolvedValueOnce({
          data: { canViewPremiumContent: false },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockPost,
          error: null,
        });

      const result = await permissionService.checkPostAccess(
        "user-1",
        "post-1"
      );

      expect(result.allowed).toBe(true);
      expect(result.upgradePrompt).toBeUndefined();
    });

    it("should allow premium users to access premium content", async () => {
      const mockPost = {
        is_premium_content: true,
        author_id: "author-1",
      };

      // Mock getUserPermissions to return premium permissions
      jest.spyOn(permissionService, "getUserPermissions").mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const result = await permissionService.checkPostAccess(
        "premium-user",
        "premium-post"
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny free users access to premium content", async () => {
      const mockPost = {
        is_premium_content: true,
        author_id: "author-1",
      };

      // Mock getUserPermissions to return free permissions
      jest.spyOn(permissionService, "getUserPermissions").mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const result = await permissionService.checkPostAccess(
        "free-user",
        "premium-post"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Conteúdo premium requer subscrição");
      expect(result.upgradePrompt).toBe(true);
    });

    it("should allow authors to access their own premium content", async () => {
      const mockPost = {
        is_premium_content: true,
        author_id: "author-1",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const result = await permissionService.checkPostAccess(
        "author-1",
        "premium-post"
      );

      expect(result.allowed).toBe(true);
    });
  });

  describe("checkConnectionPermission", () => {
    it("should allow all users to respond to connection requests", async () => {
      jest.spyOn(permissionService, "getUserPermissions").mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const result = await permissionService.checkConnectionPermission(
        "free-user",
        "respond"
      );

      expect(result.allowed).toBe(true);
    });

    it("should allow premium users to request connections", async () => {
      jest.spyOn(permissionService, "getUserPermissions").mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      const result = await permissionService.checkConnectionPermission(
        "premium-user",
        "request"
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny free users from requesting connections", async () => {
      jest.spyOn(permissionService, "getUserPermissions").mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const result = await permissionService.checkConnectionPermission(
        "free-user",
        "request"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        "Apenas utilizadores premium podem solicitar conexões"
      );
      expect(result.upgradePrompt).toBe(true);
    });
  });

  describe("getUserPremiumStatus", () => {
    it("should return correct premium status for active premium user", async () => {
      const mockProfile = {
        is_premium: true,
        premium_expires_at: "2025-12-31",
        premium_since: "2024-01-01",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const status = await permissionService.getUserPremiumStatus(
        "premium-user"
      );

      expect(status.isPremium).toBe(true);
      expect(status.expiresAt).toBe("2025-12-31");
      expect(status.since).toBe("2024-01-01");
    });

    it("should return correct status for expired premium user", async () => {
      const mockProfile = {
        is_premium: true,
        premium_expires_at: "2023-12-31", // Past date
        premium_since: "2023-01-01",
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const status = await permissionService.getUserPremiumStatus(
        "expired-user"
      );

      expect(status.isPremium).toBe(false);
      expect(status.expiresAt).toBe("2023-12-31");
      expect(status.since).toBe("2023-01-01");
    });

    it("should return false for non-premium user", async () => {
      const mockProfile = {
        is_premium: false,
        premium_expires_at: null,
        premium_since: null,
      };

      mockSupabaseInstance.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const status = await permissionService.getUserPremiumStatus("free-user");

      expect(status.isPremium).toBe(false);
      expect(status.expiresAt).toBe(null);
      expect(status.since).toBe(null);
    });
  });
});
