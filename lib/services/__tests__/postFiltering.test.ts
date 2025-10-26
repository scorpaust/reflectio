/// <reference types="jest" />
import { Post } from "@/types/post.types";

// Mock dependencies
jest.mock("@/lib/supabase/client");
jest.mock("../permissions");

import { PostFilterService } from "../postFiltering";
import { createClient } from "@/lib/supabase/client";
import { permissionService } from "../permissions";

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockPermissionService = permissionService as jest.Mocked<
  typeof permissionService
>;

describe("PostFilterService", () => {
  let postFilterService: PostFilterService;
  let mockSupabaseInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase instance
    mockSupabaseInstance = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabaseInstance);
    postFilterService = new PostFilterService();
  });

  describe("filterPostsForUser", () => {
    const mockPosts: Post[] = [
      {
        id: "post-1",
        title: "Public Post",
        content: "This is a public post",
        author_id: "user-1",
        is_premium_content: false,
        type: "thought",
        status: "published",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        sources: [],
        view_count: 0,
        reflection_count: 0,
        quality_score: 0,
        is_moderated: false,
        moderation_reason: null,
        audio_url: null,
        audio_duration: null,
        audio_waveform: null,
        audio_transcript: null,
      },
      {
        id: "post-2",
        title: "Premium Post",
        content: "This is a premium post",
        author_id: "user-2",
        is_premium_content: true,
        type: "thought",
        status: "published",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        sources: [],
        view_count: 0,
        reflection_count: 0,
        quality_score: 0,
        is_moderated: false,
        moderation_reason: null,
        audio_url: null,
        audio_duration: null,
        audio_waveform: null,
        audio_transcript: null,
      },
      {
        id: "post-3",
        title: "Own Premium Post",
        content: "This is user's own premium post",
        author_id: "user-1",
        is_premium_content: true,
        type: "thought",
        status: "published",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        sources: [],
        view_count: 0,
        reflection_count: 0,
        quality_score: 0,
        is_moderated: false,
        moderation_reason: null,
        audio_url: null,
        audio_duration: null,
        audio_waveform: null,
        audio_transcript: null,
      },
    ];

    it("should return all posts for premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      const result = await postFilterService.filterPostsForUser(
        mockPosts,
        "premium-user"
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockPosts);
    });

    it("should filter premium posts for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const result = await postFilterService.filterPostsForUser(
        mockPosts,
        "free-user"
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("post-1");
      expect(result[0].is_premium_content).toBe(false);
    });

    it("should include own posts even if premium for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      const result = await postFilterService.filterPostsForUser(
        mockPosts,
        "user-1",
        { includeOwnPosts: true }
      );

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toContain("post-1"); // Public post
      expect(result.map((p) => p.id)).toContain("post-3"); // Own premium post
    });

    it("should handle errors gracefully", async () => {
      mockPermissionService.getUserPermissions.mockRejectedValue(
        new Error("Permission service error")
      );

      const result = await postFilterService.filterPostsForUser(
        mockPosts,
        "user-1"
      );

      // Should return only non-premium posts as fallback
      expect(result).toHaveLength(1);
      expect(result[0].is_premium_content).toBe(false);
    });
  });

  describe("getVisiblePostsForUser", () => {
    it("should fetch posts with premium filtering for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      mockSupabaseInstance.single = jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const result = await postFilterService.getVisiblePostsForUser(
        "free-user"
      );

      expect(mockSupabaseInstance.or).toHaveBeenCalledWith(
        "is_premium_content.is.false,author_id.eq.free-user"
      );
      expect(result.posts).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.totalCount).toBe(0);
    });

    it("should fetch all posts for premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      const mockPosts = [
        { id: "post-1", is_premium_content: false },
        { id: "post-2", is_premium_content: true },
      ];

      mockSupabaseInstance.single = jest.fn().mockResolvedValue({
        data: mockPosts,
        error: null,
        count: 2,
      });

      const result = await postFilterService.getVisiblePostsForUser(
        "premium-user"
      );

      // Should not call .or() for premium users (no filtering needed)
      expect(mockSupabaseInstance.or).not.toHaveBeenCalled();
      expect(result.posts).toEqual(mockPosts);
    });

    it("should handle pagination correctly", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      mockSupabaseInstance.single = jest.fn().mockResolvedValue({
        data: new Array(10).fill(null).map((_, i) => ({ id: `post-${i}` })),
        error: null,
        count: 25,
      });

      const result = await postFilterService.getVisiblePostsForUser(
        "premium-user",
        { limit: 10, offset: 0 }
      );

      expect(mockSupabaseInstance.range).toHaveBeenCalledWith(0, 9);
      expect(result.hasMore).toBe(true);
      expect(result.totalCount).toBe(25);
    });
  });

  describe("isPostVisibleToUser", () => {
    it("should return true for accessible posts", async () => {
      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: true,
      });

      const result = await postFilterService.isPostVisibleToUser(
        "post-1",
        "user-1"
      );

      expect(result).toBe(true);
      expect(mockPermissionService.checkPostAccess).toHaveBeenCalledWith(
        "user-1",
        "post-1"
      );
    });

    it("should return false for inaccessible posts", async () => {
      mockPermissionService.checkPostAccess.mockResolvedValue({
        allowed: false,
        reason: "Premium content requires subscription",
      });

      const result = await postFilterService.isPostVisibleToUser(
        "premium-post",
        "free-user"
      );

      expect(result).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      mockPermissionService.checkPostAccess.mockRejectedValue(
        new Error("Permission check failed")
      );

      const result = await postFilterService.isPostVisibleToUser(
        "post-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("getPostStats", () => {
    it("should return correct stats for free users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: false,
        canCreatePremiumContent: false,
        canCreateReflectionOnPost: () => false,
        canRequestConnection: false,
        requiresMandatoryModeration: true,
      });

      // Mock count queries
      mockSupabaseInstance.single
        .mockResolvedValueOnce({ count: 100 }) // total posts
        .mockResolvedValueOnce({ count: 30 }) // premium posts
        .mockResolvedValueOnce({ count: 70 }); // public posts

      const result = await postFilterService.getPostStats("free-user");

      expect(result).toEqual({
        totalPosts: 100,
        premiumPosts: 30,
        publicPosts: 70,
        visibleToUser: 70, // Only public posts visible to free user
      });
    });

    it("should return correct stats for premium users", async () => {
      mockPermissionService.getUserPermissions.mockResolvedValue({
        canViewPremiumContent: true,
        canCreatePremiumContent: true,
        canCreateReflectionOnPost: () => true,
        canRequestConnection: true,
        requiresMandatoryModeration: false,
      });

      // Mock count queries
      mockSupabaseInstance.single
        .mockResolvedValueOnce({ count: 100 }) // total posts
        .mockResolvedValueOnce({ count: 30 }) // premium posts
        .mockResolvedValueOnce({ count: 70 }); // public posts

      const result = await postFilterService.getPostStats("premium-user");

      expect(result).toEqual({
        totalPosts: 100,
        premiumPosts: 30,
        publicPosts: 70,
        visibleToUser: 100, // All posts visible to premium user
      });
    });
  });
});
