#!/usr/bin/env tsx

/**
 * Performance benchmark script for permission system
 * Run with: npx tsx scripts/performance-benchmark.ts
 */

import { createClient } from "@/lib/supabase/client";
import { permissionService } from "@/lib/services/permissions";
import { postFilterService } from "@/lib/services/postFiltering";
import { optimizedQueryService } from "@/lib/services/optimizedQueries";
import { permissionCache } from "@/lib/services/permissionCache";
import {
  PerformanceMonitor,
  PERFORMANCE_THRESHOLDS,
} from "@/lib/utils/performanceMonitor";

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

class PermissionBenchmark {
  private supabase = createClient();
  private testUserIds: string[] = [];
  private testPostIds: string[] = [];

  async setup(): Promise<void> {
    console.log("Setting up benchmark data...");

    // Create test users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const { data } = await this.supabase.auth.signUp({
        email: `benchmark-user-${i}@example.com`,
        password: "benchmarkpassword123",
      });
      if (data.user) {
        this.testUserIds.push(data.user.id);

        // Make every other user premium
        if (i % 2 === 0) {
          await this.supabase
            .from("profiles")
            .update({
              is_premium: true,
              premium_expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .eq("id", data.user.id);
        }
      }
    }

    // Create test posts
    const posts = [];
    for (let i = 0; i < 100; i++) {
      posts.push({
        title: `Benchmark Post ${i}`,
        content: `Content for benchmark post ${i}`,
        author_id: this.testUserIds[i % this.testUserIds.length],
        is_premium_content: i % 3 === 0, // Every 3rd post is premium
      });
    }

    const { data: createdPosts } = await this.supabase
      .from("posts")
      .insert(posts)
      .select("id");

    this.testPostIds = createdPosts?.map((p) => p.id) || [];

    console.log(
      `Created ${this.testUserIds.length} test users and ${this.testPostIds.length} test posts`
    );
  }

  async cleanup(): Promise<void> {
    console.log("Cleaning up benchmark data...");

    if (this.testPostIds.length > 0) {
      await this.supabase.from("posts").delete().in("id", this.testPostIds);
    }

    if (this.testUserIds.length > 0) {
      await this.supabase.from("profiles").delete().in("id", this.testUserIds);
    }

    permissionCache.clear();
    PerformanceMonitor.clear();
  }

  async benchmark<T>(
    name: string,
    fn: () => Promise<T>,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    console.log(`Running benchmark: ${name} (${iterations} iterations)`);

    const times: number[] = [];
    let totalTime = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const duration = performance.now() - start;
      times.push(duration);
      totalTime += duration;

      // Progress indicator
      if ((i + 1) % Math.max(1, Math.floor(iterations / 10)) === 0) {
        process.stdout.write(".");
      }
    }

    console.log(""); // New line after progress dots

    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / avgTime;

    return {
      name,
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond,
    };
  }

  async runPermissionBenchmarks(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    // Benchmark permission checks
    results.push(
      await this.benchmark(
        "Permission Check (Cache Miss)",
        async () => {
          permissionCache.clear();
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          await permissionService.getUserPermissions(userId);
        },
        50
      )
    );

    results.push(
      await this.benchmark(
        "Permission Check (Cache Hit)",
        async () => {
          const userId = this.testUserIds[0];
          await permissionService.getUserPermissions(userId);
        },
        100
      )
    );

    results.push(
      await this.benchmark(
        "Post Access Check",
        async () => {
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          const postId =
            this.testPostIds[
              Math.floor(Math.random() * this.testPostIds.length)
            ];
          await permissionService.checkPostAccess(userId, postId);
        },
        100
      )
    );

    results.push(
      await this.benchmark(
        "Reflection Permission Check",
        async () => {
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          const postId =
            this.testPostIds[
              Math.floor(Math.random() * this.testPostIds.length)
            ];
          await permissionService.checkReflectionPermission(userId, postId);
        },
        100
      )
    );

    return results;
  }

  async runQueryBenchmarks(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    // Benchmark queries
    results.push(
      await this.benchmark(
        "Get Visible Posts (Regular)",
        async () => {
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          await postFilterService.getVisiblePostsForUser(userId, { limit: 20 });
        },
        50
      )
    );

    results.push(
      await this.benchmark(
        "Get Visible Posts (Optimized)",
        async () => {
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          const isPremium = Math.random() > 0.5;
          await optimizedQueryService.getVisiblePostsOptimized(
            userId,
            isPremium,
            { limit: 20 }
          );
        },
        50
      )
    );

    results.push(
      await this.benchmark(
        "Get User Posts",
        async () => {
          const targetUserId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          const viewerUserId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          await postFilterService.getUserPosts(targetUserId, viewerUserId, {
            limit: 20,
          });
        },
        50
      )
    );

    results.push(
      await this.benchmark(
        "Batch Permission Check",
        async () => {
          const checks = this.testUserIds.slice(0, 3).map((userId) => ({
            userId,
            postIds: this.testPostIds.slice(0, 5),
          }));
          await optimizedQueryService.batchCheckPostPermissions(checks);
        },
        30
      )
    );

    results.push(
      await this.benchmark(
        "Get Post Stats",
        async () => {
          const userId =
            this.testUserIds[
              Math.floor(Math.random() * this.testUserIds.length)
            ];
          await postFilterService.getPostStats(userId);
        },
        50
      )
    );

    return results;
  }

  async runCacheBenchmarks(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    // Benchmark cache operations
    results.push(
      await this.benchmark(
        "Cache Set Operation",
        async () => {
          const userId = `cache-test-${Math.random()}`;
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
        },
        1000
      )
    );

    results.push(
      await this.benchmark(
        "Cache Get Operation",
        async () => {
          const userId = this.testUserIds[0];
          permissionCache.get(userId);
        },
        1000
      )
    );

    return results;
  }

  printResults(results: BenchmarkResult[]): void {
    console.log("\n" + "=".repeat(80));
    console.log("BENCHMARK RESULTS");
    console.log("=".repeat(80));

    const maxNameLength = Math.max(...results.map((r) => r.name.length));

    console.log(
      "Name".padEnd(maxNameLength) +
        " | Iterations | Avg (ms) | Min (ms) | Max (ms) | Ops/sec"
    );
    console.log("-".repeat(maxNameLength + 55));

    for (const result of results) {
      console.log(
        result.name.padEnd(maxNameLength) +
          " | " +
          result.iterations.toString().padStart(10) +
          " | " +
          result.avgTime.toFixed(2).padStart(8) +
          " | " +
          result.minTime.toFixed(2).padStart(8) +
          " | " +
          result.maxTime.toFixed(2).padStart(8) +
          " | " +
          result.opsPerSecond.toFixed(0).padStart(7)
      );
    }

    console.log("\n");
  }

  checkThresholds(results: BenchmarkResult[]): void {
    console.log("PERFORMANCE THRESHOLD ANALYSIS");
    console.log("=".repeat(50));

    const violations: Array<{
      name: string;
      threshold: number;
      actual: number;
      ratio: number;
    }> = [];

    for (const result of results) {
      // Map benchmark names to threshold keys
      const thresholdKey = this.mapBenchmarkToThreshold(result.name);
      const threshold = PERFORMANCE_THRESHOLDS[thresholdKey];

      if (threshold && result.avgTime > threshold) {
        violations.push({
          name: result.name,
          threshold,
          actual: result.avgTime,
          ratio: result.avgTime / threshold,
        });
      }
    }

    if (violations.length === 0) {
      console.log("✅ All benchmarks are within performance thresholds!");
    } else {
      console.log("⚠️  Performance threshold violations:");
      for (const violation of violations) {
        console.log(
          `   ${violation.name}: ${violation.actual.toFixed(2)}ms ` +
            `(threshold: ${violation.threshold}ms, ${violation.ratio.toFixed(
              1
            )}x slower)`
        );
      }
    }

    console.log("\n");
  }

  private mapBenchmarkToThreshold(benchmarkName: string): string {
    const mapping: Record<string, string> = {
      "Permission Check (Cache Miss)": "permission.getUserPermissions",
      "Permission Check (Cache Hit)": "cache.get",
      "Post Access Check": "permission.checkPostAccess",
      "Reflection Permission Check": "permission.checkReflectionPermission",
      "Get Visible Posts (Regular)": "query.getVisiblePosts",
      "Get Visible Posts (Optimized)": "query.getVisiblePosts",
      "Get User Posts": "query.getUserPosts",
      "Batch Permission Check": "query.batchPermissionCheck",
      "Get Post Stats": "query.getPostStats",
      "Cache Set Operation": "cache.set",
      "Cache Get Operation": "cache.get",
    };

    return mapping[benchmarkName] || "";
  }
}

async function main(): Promise<void> {
  const benchmark = new PermissionBenchmark();

  try {
    await benchmark.setup();

    console.log("Running permission benchmarks...");
    const permissionResults = await benchmark.runPermissionBenchmarks();

    console.log("Running query benchmarks...");
    const queryResults = await benchmark.runQueryBenchmarks();

    console.log("Running cache benchmarks...");
    const cacheResults = await benchmark.runCacheBenchmarks();

    const allResults = [...permissionResults, ...queryResults, ...cacheResults];

    benchmark.printResults(allResults);
    benchmark.checkThresholds(allResults);

    // Export performance monitor data
    const monitorData = PerformanceMonitor.exportMetrics();
    console.log("Performance Monitor Data:");
    console.log(JSON.stringify(monitorData, null, 2));
  } catch (error) {
    console.error("Benchmark failed:", error);
    process.exit(1);
  } finally {
    await benchmark.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
