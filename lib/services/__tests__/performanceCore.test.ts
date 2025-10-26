import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
} from "../../utils/performanceMonitor";
import { permissionCache } from "../permissionCache";

describe("Core Performance Tests", () => {
  beforeEach(() => {
    PerformanceMonitor.clear();
    permissionCache.clear();
  });

  afterEach(() => {
    PerformanceMonitor.clear();
    permissionCache.clear();
  });

  describe("Permission Cache Performance", () => {
    it("should perform cache operations within thresholds", () => {
      const userId = "test-user";
      const testData = {
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
      };

      // Test cache set performance
      const setStart = performance.now();
      permissionCache.set(userId, testData);
      const setTime = performance.now() - setStart;

      // Test cache get performance
      const getStart = performance.now();
      const retrieved = permissionCache.get(userId);
      const getTime = performance.now() - getStart;

      expect(retrieved).toBeTruthy();
      expect(setTime).toBeLessThan(PERFORMANCE_THRESHOLDS["cache.set"]);
      expect(getTime).toBeLessThan(PERFORMANCE_THRESHOLDS["cache.get"]);

      console.log(
        `Cache set: ${setTime.toFixed(2)}ms (threshold: ${
          PERFORMANCE_THRESHOLDS["cache.set"]
        }ms)`
      );
      console.log(
        `Cache get: ${getTime.toFixed(2)}ms (threshold: ${
          PERFORMANCE_THRESHOLDS["cache.get"]
        }ms)`
      );
    });

    it("should handle multiple cache operations efficiently", () => {
      const iterations = 100;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();

        permissionCache.set(`user-${i}`, {
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

        const retrieved = permissionCache.get(`user-${i}`);
        const time = performance.now() - start;
        times.push(time);

        expect(retrieved).toBeTruthy();
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(10); // Average should be under 10ms
      expect(maxTime).toBeLessThan(50); // Max should be under 50ms

      console.log(`Average cache operation: ${avgTime.toFixed(2)}ms`);
      console.log(`Max cache operation: ${maxTime.toFixed(2)}ms`);
    });

    it("should handle cache invalidation efficiently", () => {
      // Add many entries
      for (let i = 0; i < 1000; i++) {
        permissionCache.set(`invalidation-test-${i}`, {
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

      const initialSize = permissionCache.getStats().size;
      expect(initialSize).toBeGreaterThan(0);

      // Test invalidation performance
      const start = performance.now();
      permissionCache.clear();
      const clearTime = performance.now() - start;

      const finalSize = permissionCache.getStats().size;
      expect(finalSize).toBe(0);
      expect(clearTime).toBeLessThan(100); // Should clear under 100ms

      console.log(
        `Cache clear time: ${clearTime.toFixed(2)}ms for ${initialSize} entries`
      );
    });
  });

  describe("Performance Monitor Tests", () => {
    it("should record and calculate metrics correctly", () => {
      const metricName = "test.operation";
      const samples = [10, 20, 30, 40, 50];

      samples.forEach((sample) => {
        PerformanceMonitor.record(metricName, sample);
      });

      const stats = PerformanceMonitor.getStats(metricName);
      expect(stats).toBeTruthy();

      if (stats) {
        expect(stats.count).toBe(5);
        expect(stats.avg).toBe(30);
        expect(stats.min).toBe(10);
        expect(stats.max).toBe(50);
        expect(stats.p95).toBe(50);
        expect(stats.p99).toBe(50);
      }
    });

    it("should detect threshold violations", () => {
      PerformanceMonitor.record("slow.operation", 100);
      PerformanceMonitor.record("fast.operation", 5);

      const testThresholds = {
        "slow.operation": 50,
        "fast.operation": 10,
      };

      const { violations } = PerformanceMonitor.checkThresholds(testThresholds);

      expect(violations.length).toBe(1);
      expect(violations[0].metric).toBe("slow.operation");
      expect(violations[0].actual).toBe(100);
      expect(violations[0].threshold).toBe(50);
    });

    it("should export metrics in correct format", () => {
      PerformanceMonitor.record("export.test", 25);

      const exported = PerformanceMonitor.exportMetrics();

      expect(exported).toHaveProperty("timestamp");
      expect(exported).toHaveProperty("metrics");
      expect(typeof exported.timestamp).toBe("string");
      expect(exported.metrics["export.test"]).toBeTruthy();
    });
  });

  describe("Memory Usage Tests", () => {
    it("should not cause significant memory leaks", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        permissionCache.set(`memory-test-${i}`, {
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

        // Also test retrieval
        permissionCache.get(`memory-test-${i}`);
      }

      // Clear cache
      permissionCache.clear();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );

      // Memory increase should be reasonable (less than 5MB for this test)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe("Cache TTL Performance", () => {
    it("should handle TTL expiration efficiently", (done) => {
      const userId = "ttl-performance-test";

      // Set with very short TTL
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
        50
      ); // 50ms TTL

      expect(permissionCache.has(userId)).toBe(true);

      setTimeout(() => {
        const start = performance.now();
        const result = permissionCache.get(userId);
        const checkTime = performance.now() - start;

        expect(result).toBeNull(); // Should be expired
        expect(checkTime).toBeLessThan(10); // Check should be fast

        console.log(`TTL expiration check: ${checkTime.toFixed(2)}ms`);
        done();
      }, 100);
    });
  });
});
