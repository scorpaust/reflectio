/// <reference types="jest" />

// Mock dependencies before importing
jest.mock("@/lib/supabase/client");
jest.mock("../permissions");

import { ReflectionPermissionChecker } from "../reflectionPermissions";
import { createClient } from "@/lib/supabase/client";
import { permissionService } from "../permissions";

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockPermissionService = permissionService as jest.Mocked<
  typeof permissionService
>;

describe("ReflectionPermissionChecker", () => {
  let reflectionPermissionChecker: ReflectionPermissionChecker;
  let mockSupabaseInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase instance
    mockSupabaseInstance = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabaseInstance);
    reflectionPermissionChecker = new ReflectionPermissionChecker();
  });

  describe("canCreateReflection", () => {
    describe("Free users creating reflections on public posts", () => {
      it("should allow free users to create reflections on public posts from other free users", async () => {
        // Mock free user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: (
            postId,
            postAuthorIsPremium,
            postIsPremium
          ) => !postIsPremium && !postAuthorIsPremium,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        // Mock post data - public post from free user
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "post-1",
            is_premium_content: false,
            author_id: "author-1",
            author: {
              id: "author-1",
              is_premium: false,
              premium_expires_at: null,
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "free-user",
          "post-1"
        );

        expect(result.allowed).toBe(true);
        expect(result.reason).toBeUndefined();
        expect(result.upgradePrompt).toBeUndefined();
      });

      it("should allow users to create reflections on their own posts regardless of premium status", async () => {
        // Mock free user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: (
            postId,
            postAuthorIsPremium,
            postIsPremium
          ) => !postIsPremium && !postAuthorIsPremium,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        // Mock post data - user's own premium post
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "post-1",
            is_premium_content: true,
            author_id: "free-user", // Same as requesting user
            author: {
              id: "free-user",
              is_premium: false,
              premium_expires_at: null,
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "free-user",
          "post-1"
        );

        expect(result.allowed).toBe(true);
      });
    });

    describe("Blocking reflections on premium posts for free users", () => {
      it("should block free users from creating reflections on premium content", async () => {
        // Mock free user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: (
            postId,
            postAuthorIsPremium,
            postIsPremium
          ) => !postIsPremium && !postAuthorIsPremium,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        // Mock premium post data
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "premium-post",
            is_premium_content: true,
            author_id: "premium-author",
            author: {
              id: "premium-author",
              is_premium: true,
              premium_expires_at: "2025-12-31",
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "free-user",
          "premium-post"
        );

        expect(result.allowed).toBe(false);
        expect(result.reason).toBe(
          "Apenas utilizadores Premium podem criar reflexões em conteúdo Premium"
        );
        expect(result.upgradePrompt).toBe(true);
      });

      it("should block free users from creating reflections on posts from premium authors", async () => {
        // Mock free user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: (
            postId,
            postAuthorIsPremium,
            postIsPremium
          ) => !postIsPremium && !postAuthorIsPremium,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        // Mock public post from premium author
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "post-from-premium",
            is_premium_content: false,
            author_id: "premium-author",
            author: {
              id: "premium-author",
              is_premium: true,
              premium_expires_at: "2025-12-31",
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "free-user",
          "post-from-premium"
        );

        expect(result.allowed).toBe(false);
        expect(result.reason).toBe(
          "Apenas utilizadores Premium podem criar reflexões em posts de utilizadores Premium"
        );
        expect(result.upgradePrompt).toBe(true);
      });

      it("should block free users from creating reflections on posts from expired premium authors", async () => {
        // Mock free user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: (
            postId,
            postAuthorIsPremium,
            postIsPremium
          ) => !postIsPremium && !postAuthorIsPremium,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        // Mock post from expired premium author (should be treated as free user now)
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "post-from-expired",
            is_premium_content: false,
            author_id: "expired-author",
            author: {
              id: "expired-author",
              is_premium: true,
              premium_expires_at: "2023-12-31", // Past date
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "free-user",
          "post-from-expired"
        );

        // Should be allowed since expired premium is treated as free user
        expect(result.allowed).toBe(true);
      });
    });

    describe("Premium users full access", () => {
      it("should allow premium users to create reflections on any post", async () => {
        // Mock premium user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: true,
          canCreatePremiumContent: true,
          canCreateReflectionOnPost: () => true,
          canRequestConnection: true,
          requiresMandatoryModeration: false,
        });

        // Mock premium post data
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "premium-post",
            is_premium_content: true,
            author_id: "premium-author",
            author: {
              id: "premium-author",
              is_premium: true,
              premium_expires_at: "2025-12-31",
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "premium-user",
          "premium-post"
        );

        expect(result.allowed).toBe(true);
        expect(result.reason).toBeUndefined();
        expect(result.upgradePrompt).toBeUndefined();
      });

      it("should allow premium users to create reflections on public posts", async () => {
        // Mock premium user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: true,
          canCreatePremiumContent: true,
          canCreateReflectionOnPost: () => true,
          canRequestConnection: true,
          requiresMandatoryModeration: false,
        });

        // Mock public post data
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "public-post",
            is_premium_content: false,
            author_id: "free-author",
            author: {
              id: "free-author",
              is_premium: false,
              premium_expires_at: null,
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "premium-user",
          "public-post"
        );

        expect(result.allowed).toBe(true);
      });

      it("should allow premium users to create reflections on posts from other premium users", async () => {
        // Mock premium user permissions
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: true,
          canCreatePremiumContent: true,
          canCreateReflectionOnPost: () => true,
          canRequestConnection: true,
          requiresMandatoryModeration: false,
        });

        // Mock post from another premium user
        mockSupabaseInstance.single.mockResolvedValue({
          data: {
            id: "other-premium-post",
            is_premium_content: false,
            author_id: "other-premium-user",
            author: {
              id: "other-premium-user",
              is_premium: true,
              premium_expires_at: "2025-12-31",
            },
          },
          error: null,
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "premium-user",
          "other-premium-post"
        );

        expect(result.allowed).toBe(true);
      });
    });

    describe("Error handling", () => {
      it("should handle post not found error", async () => {
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: () => false,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        mockSupabaseInstance.single.mockResolvedValue({
          data: null,
          error: { message: "Post not found" },
        });

        const result = await reflectionPermissionChecker.canCreateReflection(
          "user-1",
          "nonexistent-post"
        );

        expect(result.allowed).toBe(false);
        expect(result.reason).toBe("Post não encontrado");
      });

      it("should handle permission service errors gracefully", async () => {
        mockPermissionService.getUserPermissions.mockRejectedValue(
          new Error("Permission service error")
        );

        const result = await reflectionPermissionChecker.canCreateReflection(
          "user-1",
          "post-1"
        );

        expect(result.allowed).toBe(false);
        expect(result.reason).toBe("Erro ao verificar permissões de reflexão");
      });

      it("should handle database errors gracefully", async () => {
        mockPermissionService.getUserPermissions.mockResolvedValue({
          canViewPremiumContent: false,
          canCreatePremiumContent: false,
          canCreateReflectionOnPost: () => false,
          canRequestConnection: false,
          requiresMandatoryModeration: true,
        });

        mockSupabaseInstance.single.mockRejectedValue(
          new Error("Database connection error")
        );

        const result = await reflectionPermissionChecker.canCreateReflection(
          "user-1",
          "post-1"
        );

        expect(result.allowed).toBe(false);
        expect(result.reason).toBe("Erro ao verificar permissões de reflexão");
      });
    });
  });

  describe("getReflectionRestrictionInfo", () => {
    it("should return detailed restriction info for free user on premium content", async () => {
      // Mock free user permissions
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: (
          postId,
          postAuthorIsPremium,
          postIsPremium
        ) => !postIsPremium && !postAuthorIsPremium,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock premium post data
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "premium-post",
          is_premium_content: true,
          author_id: "premium-author",
          author: {
            id: "premium-author",
            is_premium: true,
            premium_expires_at: "2025-12-31",
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "free-user",
          "premium-post"
        );

      expect(result.canReflect).toBe(false);
      expect(result.postIsPremium).toBe(true);
      expect(result.authorIsPremium).toBe(true);
      expect(result.userIsPremium).toBe(false);
      expect(result.restrictionReason).toBe("Conteúdo Premium");
      expect(result.upgradeMessage).toBe(
        "Faça upgrade para Premium para criar reflexões em conteúdo Premium"
      );
    });

    it("should return detailed restriction info for free user on post from premium author", async () => {
      // Mock free user permissions
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: (
          postId,
          postAuthorIsPremium,
          postIsPremium
        ) => !postIsPremium && !postAuthorIsPremium,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock public post from premium author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "post-from-premium",
          is_premium_content: false,
          author_id: "premium-author",
          author: {
            id: "premium-author",
            is_premium: true,
            premium_expires_at: "2025-12-31",
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "free-user",
          "post-from-premium"
        );

      expect(result.canReflect).toBe(false);
      expect(result.postIsPremium).toBe(false);
      expect(result.authorIsPremium).toBe(true);
      expect(result.userIsPremium).toBe(false);
      expect(result.restrictionReason).toBe("Autor Premium");
      expect(result.upgradeMessage).toBe(
        "Faça upgrade para Premium para criar reflexões em posts de utilizadores Premium"
      );
    });

    it("should return positive info for allowed reflections", async () => {
      // Mock free user permissions
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: (
          postId,
          postAuthorIsPremium,
          postIsPremium
        ) => !postIsPremium && !postAuthorIsPremium,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock public post from free author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "public-post",
          is_premium_content: false,
          author_id: "free-author",
          author: {
            id: "free-author",
            is_premium: false,
            premium_expires_at: null,
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "free-user",
          "public-post"
        );

      expect(result.canReflect).toBe(true);
      expect(result.postIsPremium).toBe(false);
      expect(result.authorIsPremium).toBe(false);
      expect(result.userIsPremium).toBe(false);
      expect(result.restrictionReason).toBeUndefined();
      expect(result.upgradeMessage).toBeUndefined();
    });

    it("should handle post not found error", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockSupabaseInstance.single.mockResolvedValue({
        data: null,
        error: { message: "Post not found" },
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "user-1",
          "nonexistent-post"
        );

      expect(result.canReflect).toBe(false);
      expect(result.postIsPremium).toBe(false);
      expect(result.authorIsPremium).toBe(false);
      expect(result.userIsPremium).toBe(false);
      expect(result.restrictionReason).toBe("Post não encontrado");
    });
  });

  describe("Premium status detection", () => {
    it("should correctly identify active premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock post with active premium author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "post-1",
          is_premium_content: false,
          author_id: "premium-author",
          author: {
            id: "premium-author",
            is_premium: true,
            premium_expires_at: "2025-12-31", // Future date
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "user-1",
          "post-1"
        );

      expect(result.authorIsPremium).toBe(true);
    });

    it("should correctly identify expired premium users as non-premium", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock post with expired premium author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "post-1",
          is_premium_content: false,
          author_id: "expired-author",
          author: {
            id: "expired-author",
            is_premium: true,
            premium_expires_at: "2023-12-31", // Past date
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "user-1",
          "post-1"
        );

      expect(result.authorIsPremium).toBe(false);
    });

    it("should handle premium users with no expiration date", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock post with lifetime premium author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "post-1",
          is_premium_content: false,
          author_id: "lifetime-author",
          author: {
            id: "lifetime-author",
            is_premium: true,
            premium_expires_at: null, // No expiration
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "user-1",
          "post-1"
        );

      expect(result.authorIsPremium).toBe(true);
    });

    it("should correctly identify non-premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock post with free author
      mockSupabaseInstance.single.mockResolvedValue({
        data: {
          id: "post-1",
          is_premium_content: false,
          author_id: "free-author",
          author: {
            id: "free-author",
            is_premium: false,
            premium_expires_at: null,
          },
        },
        error: null,
      });

      const result =
        await reflectionPermissionChecker.getReflectionRestrictionInfo(
          "user-1",
          "post-1"
        );

      expect(result.authorIsPremium).toBe(false);
    });
  });
});
