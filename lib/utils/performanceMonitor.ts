/**
 * Performance monitoring utility for permission system
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static readonly MAX_SAMPLES = 100; // Keep last 100 samples per metric

  /**
   * Record a performance metric
   */
  static record(metricName: string, duration: number): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }

    const samples = this.metrics.get(metricName)!;
    samples.push(duration);

    // Keep only the last MAX_SAMPLES
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }
  }

  /**
   * Get statistics for a metric
   */
  static getStats(metricName: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const samples = this.metrics.get(metricName);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count,
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /**
   * Get all metrics
   */
  static getAllStats(): Record<
    string,
    ReturnType<typeof PerformanceMonitor.getStats>
  > {
    const result: Record<
      string,
      ReturnType<typeof PerformanceMonitor.getStats>
    > = {};

    for (const metricName of this.metrics.keys()) {
      result[metricName] = this.getStats(metricName);
    }

    return result;
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear();
  }

  /**
   * Clear specific metric
   */
  static clearMetric(metricName: string): void {
    this.metrics.delete(metricName);
  }

  /**
   * Decorator for measuring function performance
   */
  static measure<T extends (...args: any[]) => any>(
    metricName: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          PerformanceMonitor.record(metricName, duration);
        });
      } else {
        const duration = performance.now() - start;
        PerformanceMonitor.record(metricName, duration);
        return result;
      }
    }) as T;
  }

  /**
   * Async decorator for measuring async function performance
   */
  static measureAsync<T extends (...args: any[]) => Promise<any>>(
    metricName: string,
    fn: T
  ): T {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        return result;
      } finally {
        const duration = performance.now() - start;
        PerformanceMonitor.record(metricName, duration);
      }
    }) as T;
  }

  /**
   * Manual timing utility
   */
  static startTimer(metricName: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      PerformanceMonitor.record(metricName, duration);
    };
  }

  /**
   * Check if any metrics exceed thresholds
   */
  static checkThresholds(thresholds: Record<string, number>): {
    violations: Array<{
      metric: string;
      threshold: number;
      actual: number;
      type: "avg" | "p95" | "p99";
    }>;
  } {
    const violations: Array<{
      metric: string;
      threshold: number;
      actual: number;
      type: "avg" | "p95" | "p99";
    }> = [];

    for (const [metricName, threshold] of Object.entries(thresholds)) {
      const stats = this.getStats(metricName);
      if (!stats) continue;

      // Check different percentiles
      const checks = [
        { value: stats.avg, type: "avg" as const },
        { value: stats.p95, type: "p95" as const },
        { value: stats.p99, type: "p99" as const },
      ];

      for (const check of checks) {
        if (check.value > threshold) {
          violations.push({
            metric: metricName,
            threshold,
            actual: check.value,
            type: check.type,
          });
        }
      }
    }

    return { violations };
  }

  /**
   * Export metrics for external monitoring
   */
  static exportMetrics(): {
    timestamp: string;
    metrics: Record<string, ReturnType<typeof PerformanceMonitor.getStats>>;
  } {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getAllStats(),
    };
  }
}

/**
 * Performance thresholds for permission system
 */
export const PERFORMANCE_THRESHOLDS = {
  "permission.getUserPermissions": 50, // 50ms
  "permission.checkPostAccess": 30, // 30ms
  "permission.checkReflectionPermission": 30, // 30ms
  "permission.checkConnectionPermission": 20, // 20ms
  "cache.get": 5, // 5ms
  "cache.set": 5, // 5ms
  "query.getVisiblePosts": 100, // 100ms
  "query.getUserPosts": 80, // 80ms
  "query.batchPermissionCheck": 150, // 150ms
  "query.getPostStats": 60, // 60ms
};

/**
 * Middleware for automatic performance monitoring
 */
export const withPerformanceMonitoring = {
  /**
   * Monitor permission service methods
   */
  permissions: {
    getUserPermissions: PerformanceMonitor.measureAsync(
      "permission.getUserPermissions",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    checkPostAccess: PerformanceMonitor.measureAsync(
      "permission.checkPostAccess",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    checkReflectionPermission: PerformanceMonitor.measureAsync(
      "permission.checkReflectionPermission",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    checkConnectionPermission: PerformanceMonitor.measureAsync(
      "permission.checkConnectionPermission",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
  },

  /**
   * Monitor cache operations
   */
  cache: {
    get: PerformanceMonitor.measure(
      "cache.get",
      (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    set: PerformanceMonitor.measure(
      "cache.set",
      (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
  },

  /**
   * Monitor query operations
   */
  queries: {
    getVisiblePosts: PerformanceMonitor.measureAsync(
      "query.getVisiblePosts",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    getUserPosts: PerformanceMonitor.measureAsync(
      "query.getUserPosts",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    batchPermissionCheck: PerformanceMonitor.measureAsync(
      "query.batchPermissionCheck",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
    getPostStats: PerformanceMonitor.measureAsync(
      "query.getPostStats",
      async (originalFn: Function, ...args: any[]) => originalFn(...args)
    ),
  },
};
