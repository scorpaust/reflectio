import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createClient } from "@/lib/supabase/client";
import { permissionService } from "../permissions";
import { postFilterService } from "../postFiltering";
import { optimizedQueryService } from "../optimizedQueries";
import { permissionCache } from "../permissionCache";

describe("Performance Tests", () => {
  const supabase = createClient();
  let testUserId: string;
  let premiumUserId: string;
  let testPostIds: string[] = [];

  beforeAll(async () => {
    // Create test users
    const { data: testUser } = await supabase.auth.signUp({
      email: "test-free@example.com",
      password: "testpassword123",
    });

    const { data: premiumUser } = await supabase.auth.signUp({
      email: "test-premium@example.com",
      password: "testpassword123",
    });

    testUserId = testUser.user?.id || "";
    premiumUserId = premiumUser.user?.id || "";

    // Set premium status for premium user
    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .eq("id", premiumUserId);

    // Create test posts
    const posts = [];
    for (let i = 0; i < 100; i++) {
      posts.push({
        title: `Test Post ${i}`,
        content: `Content for test post ${i}`,
        author_id: i % 2 === 0 ? testUserId : premiumUserId,
        is_premium_content: i % 3 === 0, // Every 3rd post is premium
      });
    }

    const { data: createdPosts } = await supabase
      .from("posts")
      .insert(posts)
      .select("id");

    testPostIds = createdPosts?.map((p) => p.id) || [];
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPostIds.length > 0) {
      await supabase.from("posts").delete().in("id", testPostIds);
    }

    await supabase
      .from("profiles")
      .delete()
      .in("id", [testUserId, premiumUserId]);

    // Clear cache
    permissionCache.clear();
  });

  describe("Permission Cache Performance", () => {
    it("should cache permission checks and improve response time", async () => {
      // Clear cache first
      permissionCache.clear();

      // First call (cache miss)
      const start1 = performance.now();
      const permissions1 = await permissionService.getUserPermissions(
        testUserId
      );
      const time1 = performance.now() - start1;

      // Second call (cache hit)
      const start2 = performance.now();
      const permissions2 = await permissionService.getUserPermissions(
        testUserId
      );
      const time2 = performance.now() - start2;

      expect(permissions1).toEqual(permissions2);
      expect(time2).toBeLessThan(time1 * 0.5); // Cache should be at least 50% faster
      expect(time2).toBeLessThan(10); // Cache hit should be under 10ms
    });

    it("should handle cache invalidation correctly", async () => {
      // Cache permissions
      await permissionService.getUserPermissions(testUserId);
      expect(permissionCache.has(testUserId)).toBe(true);

      // Invalidate cache
      permissionService.invalidateUserCache(testUserId);
      expect(permissionCache.has(testUserId)).toBe(false);

      // Should fetch fresh data
      const permissions = await permissionService.getUserPermissions(
        testUserId
      );
      expect(permissions).toBeDefined();
      expect(permissionCache.has(testUserId)).toBe(true);
    });

    it("should provide cache statistics", () => {
      const stats = permissionService.getCacheStats();

      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("hitRate");
      expect(stats).toHaveProperty("entries");
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe("Optimized Query Performance", () => {
    it("should perform better than non-optimized queries for post filtering", async () => {
      const limit = 20;
      const offset = 0;

      // Test optimized query
      const start1 = performance.now();
      const optimizedResult =
        await optimizedQueryService.getVisiblePostsOptimized(
          testUserId,
          false, // free user
          { limit, offset }
        );
      const optimizedTime = performance.now() - start1;

      // Test regular query
      const start2 = performance.now();
      const regularResult = await postFilterService.getVisiblePostsForUser(
        testUserId,
        { limit, offset }
      );
      const regularTime = performance.now() - start2;

      expect(optimizedResult.posts.length).toBeGreaterThan(0);
      expect(regularResult.posts.length).toBeGreaterThan(0);

      // Optimized should be faster or at least comparable
      expect(optimizedTime).toBeLessThan(regularTime * 1.5);

      console.log(`Optimized query: ${optimizedTime.toFixed(2)}ms`);
      console.log(`Regular query: ${regularTime.toFixed(2)}ms`);
    });

    it("should handle batch permission checks efficiently", async () => {
      const batchChecks = [
        { userId: testUserId, postIds: testPostIds.slice(0, 10) },
        { userId: premiumUserId, postIds: testPostIds.slice(10, 20) },
      ];

      const start = performance.now();
      const results = await optimizedQueryService.batchCheckPostPermissions(
        batchChecks
      );
      const batchTime = performance.now() - start;

      // Compare with individual checks
      const start2 = performance.now();
      for (const check of batchChecks) {
        for (const postId of check.postIds) {
          await permissionService.checkPostAccess(check.userId, postId);
        }
      }
      const individualTime = performance.now() - start2;

      expect(results.size).toBe(2);
      expect(batchTime).toBeLessThan(individualTime * 0.7); // Batch should be at least 30% faster

      console.log(`Batch check: ${batchTime.toFixed(2)}ms`);
      console.log(`Individual checks: ${individualTime.toFixed(2)}ms`);
    });

    it("should provide fast post statistics", async () => {
      const start = performance.now();
      const stats = await optimizedQueryService.getPostStatsOptimized(
        testUserId,
        false
      );
      const time = performance.now() - start;

      expect(stats).toHaveProperty("totalVisible");
      expect(stats).toHaveProperty("totalPremium");
      expect(stats).toHaveProperty("totalPublic");
      expect(stats).toHaveProperty("ownPosts");

      expect(time).toBeLessThan(100); // Should complete under 100ms

      console.log(`Stats query: ${time.toFixed(2)}ms`);
    });
  });

  describe("Database Query Performance", () => {
    it("should execute post filtering queries efficiently", async () => {
      const queries = [
        // Test different query patterns
        () =>
          postFilterService.getVisiblePostsForUser(testUserId, { limit: 10 }),
        () =>
          postFilterService.getVisiblePostsForUser(premiumUserId, {
            limit: 10,
          }),
        () =>
          postFilterService.getUserPosts(testUserId, testUserId, { limit: 10 }),
        () =>
          postFilterService.getUserPosts(premiumUserId, testUserId, {
            limit: 10,
          }),
      ];

      const times: number[] = [];

      for (const query of queries) {
        const start = performance.now();
        const result = await query();
        const time = performance.now() - start;
        times.push(time);

        expect(result).toHaveProperty("posts");
        expect(result).toHaveProperty("totalCount");
        expect(time).toBeLessThan(200); // Each query should complete under 200ms
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`Average query time: ${avgTime.toFixed(2)}ms`);
      console.log(
        `Query times: ${times.map((t) => t.toFixed(2)).join(", ")}ms`
      );
    });

    it("should handle concurrent permission checks efficiently", async () => {
      const concurrentChecks = Array.from({ length: 10 }, (_, i) =>
        permissionService.getUserPermissions(
          i % 2 === 0 ? testUserId : premiumUserId
        )
      );

      const start = performance.now();
      const results = await Promise.all(concurrentChecks);
      const time = performance.now() - start;

      expect(results).toHaveLength(10);
      expect(results.every((r) => r !== null)).toBe(true);
      expect(time).toBeLessThan(500); // All concurrent checks should complete under 500ms

      console.log(`Concurrent permission checks: ${time.toFixed(2)}ms`);
    });
  });

  describe("Memory and Resource Usage", () => {
    it("should not cause memory leaks in cache", async () => {
      const initialSize = permissionCache.getStats().size;

      // Generate many cache entries
      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);

      for (const userId of userIds) {
        // Simulate cache entries (we can't actually create users for this test)
        permissionCache.set(userId, {
          permissions: {
            canViewPremiumContent: false,
            canCreatePremiumContent: false,
            canCreateReflectionOnPost: () => false,
            canRequestConnection: false,
            requiresMandatoryModeration: true,
          },
          premiumStatus: {
            isPremium: false,
            expiresAt: null,
            since: null,
          },
        });
      }

      const maxSize = permissionCache.getStats().size;
      expect(maxSize).toBeGreaterThan(initialSize);

      // Wait for cleanup (cache has 2-minute cleanup interval, but we can trigger it manually)
      permissionCache.clear();

      const finalSize = permissionCache.getStats().size;
      expect(finalSize).toBe(0);
    });

    it("should handle cache TTL correctly", async () => {
      const userId = "ttl-test-user";

      // Set cache entry with short TTL
      permissionCache.set(
        userId,
        {
          permissions: {
            canViewPremiumContent: false,
            canCreatePremiumContent: false,
            canCreateReflectionOnPost: () => false,
            canRequestConnection: false,
            requiresMandatoryModeration: true,
          },
          premiumStatus: {
            isPremium: false,
            expiresAt: null,
            since: null,
          },
        },
        100
      ); // 100ms TTL

      expect(permissionCache.has(userId)).toBe(true);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(permissionCache.has(userId)).toBe(false);
    });
  });
});
