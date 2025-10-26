import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
} from "../../utils/performanceMonitor";
import { permissionService } from "../permissions";
import { postFilterService } from "../postFiltering";
import { optimizedQueryService } from "../optimizedQueries";
import { permissionCache } from "../permissionCache";

describe("Performance Benchmarks", () => {
  beforeAll(() => {
    PerformanceMonitor.clear();
  });

  afterAll(() => {
    PerformanceMonitor.clear();
  });

  describe("Cache Performance Benchmarks", () => {
    it("should meet cache performance thresholds", async () => {
      const userId = "benchmark-user";
      const iterations = 100;

      // Benchmark cache set operations
      for (let i = 0; i < iterations; i++) {
        const stopTimer = PerformanceMonitor.startTimer("cache.set");
        permissionCache.set(`${userId}-${i}`, {
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
        stopTimer();
      }

      // Benchmark cache get operations
      for (let i = 0; i < iterations; i++) {
        const stopTimer = PerformanceMonitor.startTimer("cache.get");
        permissionCache.get(`${userId}-${i}`);
        stopTimer();
      }

      const setStats = PerformanceMonitor.getStats("cache.set");
      const getStats = PerformanceMonitor.getStats("cache.get");

      expect(setStats).toBeTruthy();
      expect(getStats).toBeTruthy();

      if (setStats && getStats) {
        expect(setStats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS["cache.set"]);
        expect(getStats.avg).toBeLessThan(PERFORMANCE_THRESHOLDS["cache.get"]);

        console.log(
          `Cache set avg: ${setStats.avg.toFixed(2)}ms (threshold: ${
            PERFORMANCE_THRESHOLDS["cache.set"]
          }ms)`
        );
        console.log(
          `Cache get avg: ${getStats.avg.toFixed(2)}ms (threshold: ${
            PERFORMANCE_THRESHOLDS["cache.get"]
          }ms)`
        );
      }
    });

    it("should handle cache cleanup efficiently", () => {
      const initialSize = permissionCache.getStats().size;

      // Add many entries
      for (let i = 0; i < 1000; i++) {
        permissionCache.set(
          `cleanup-test-${i}`,
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
          1
        ); // Very short TTL
      }

      const maxSize = permissionCache.getStats().size;
      expect(maxSize).toBeGreaterThan(initialSize);

      // Wait for entries to expire and cleanup
      setTimeout(() => {
        const finalSize = permissionCache.getStats().size;
        expect(finalSize).toBeLessThan(maxSize);
      }, 100);
    });
  });

  describe("Query Performance Benchmarks", () => {
    it("should benchmark optimized vs regular queries", async () => {
      const testUserId = "benchmark-query-user";
      const iterations = 10;

      // Benchmark optimized queries
      const optimizedTimes: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await optimizedQueryService.getVisiblePostsOptimized(
          testUserId,
          false,
          { limit: 20 }
        );
        optimizedTimes.push(performance.now() - start);
      }

      // Benchmark regular queries
      const regularTimes: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await postFilterService.getVisiblePostsForUser(testUserId, {
          limit: 20,
        });
        regularTimes.push(performance.now() - start);
      }

      const avgOptimized =
        optimizedTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgRegular = regularTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`Optimized queries avg: ${avgOptimized.toFixed(2)}ms`);
      console.log(`Regular queries avg: ${avgRegular.toFixed(2)}ms`);
      console.log(
        `Performance improvement: ${(
          ((avgRegular - avgOptimized) / avgRegular) *
          100
        ).toFixed(1)}%`
      );

      // Optimized should be faster or at least not significantly slower
      expect(avgOptimized).toBeLessThan(avgRegular * 1.2);
    });

    it("should benchmark batch vs individual permission checks", async () => {
      const userIds = ["user1", "user2", "user3"];
      const postIds = ["post1", "post2", "post3", "post4", "post5"];
      const iterations = 5;

      // Benchmark batch checks
      const batchTimes: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await optimizedQueryService.batchCheckPostPermissions([
          { userId: userIds[0], postIds },
          { userId: userIds[1], postIds },
          { userId: userIds[2], postIds },
        ]);
        batchTimes.push(performance.now() - start);
      }

      const avgBatch = batchTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`Batch permission checks avg: ${avgBatch.toFixed(2)}ms`);

      // Should meet performance threshold
      expect(avgBatch).toBeLessThan(
        PERFORMANCE_THRESHOLDS["query.batchPermissionCheck"]
      );
    });
  });

  describe("Memory Usage Benchmarks", () => {
    it("should not cause memory leaks during intensive operations", async () => {
      const initialMemory = process.memoryUsage();

      // Perform intensive operations
      for (let i = 0; i < 100; i++) {
        // Cache operations
        permissionCache.set(`memory-test-${i}`, {
          permissions: {
            canViewPremiumContent: i % 2 === 0,
            canCreatePremiumContent: i % 2 === 0,
            canCreateReflectionOnPost: () => i % 2 === 0,
            canRequestConnection: i % 2 === 0,
            requiresMandatoryModeration: i % 2 !== 0,
          },
          premiumStatus: {
            isPremium: i % 2 === 0,
            expiresAt: null,
            since: null,
          },
        });

        // Get operations
        permissionCache.get(`memory-test-${i}`);
      }

      // Clear cache
      permissionCache.clear();

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );

      // Memory increase should be reasonable (less than 10MB for this test)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe("Threshold Compliance", () => {
    it("should check all performance thresholds", () => {
      // Record some sample metrics
      PerformanceMonitor.record("permission.getUserPermissions", 25);
      PerformanceMonitor.record("permission.checkPostAccess", 15);
      PerformanceMonitor.record("cache.get", 2);
      PerformanceMonitor.record("cache.set", 3);

      const { violations } = PerformanceMonitor.checkThresholds(
        PERFORMANCE_THRESHOLDS
      );

      console.log("Performance threshold violations:", violations);

      // Should have no violations for our sample data
      expect(violations.length).toBe(0);
    });

    it("should export metrics correctly", () => {
      const exported = PerformanceMonitor.exportMetrics();

      expect(exported).toHaveProperty("timestamp");
      expect(exported).toHaveProperty("metrics");
      expect(typeof exported.timestamp).toBe("string");
      expect(typeof exported.metrics).toBe("object");

      console.log("Exported metrics:", JSON.stringify(exported, null, 2));
    });
  });
});
