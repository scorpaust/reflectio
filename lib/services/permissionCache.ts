import { UserPermissions } from "./permissions";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface PermissionCacheData {
  permissions: UserPermissions;
  premiumStatus: {
    isPremium: boolean;
    expiresAt: string | null;
    since: string | null;
  };
}

export class PermissionCache {
  private cache = new Map<string, CacheEntry<PermissionCacheData>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly PREMIUM_STATUS_TTL = 10 * 60 * 1000; // 10 minutes for premium status
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  /**
   * Get cached permissions for a user
   */
  get(userId: string): PermissionCacheData | null {
    const entry = this.cache.get(userId);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(userId);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached permissions for a user
   */
  set(userId: string, data: PermissionCacheData, customTtl?: number): void {
    const ttl = customTtl || this.DEFAULT_TTL;

    this.cache.set(userId, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Invalidate cache for multiple users
   */
  invalidateMultiple(userIds: string[]): void {
    userIds.forEach((userId) => this.cache.delete(userId));
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{
      userId: string;
      age: number;
      ttl: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([userId, entry]) => ({
      userId,
      age: now - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      entries,
    };
  }

  /**
   * Check if user permissions are cached
   */
  has(userId: string): boolean {
    const entry = this.cache.get(userId);
    if (!entry) return false;

    // Check if not expired
    return Date.now() - entry.timestamp <= entry.ttl;
  }

  /**
   * Get remaining TTL for a cached entry
   */
  getRemainingTtl(userId: string): number {
    const entry = this.cache.get(userId);
    if (!entry) return 0;

    const remaining = entry.ttl - (Date.now() - entry.timestamp);
    return Math.max(0, remaining);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [userId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(userId);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(
        `Cleaned up ${expiredKeys.length} expired permission cache entries`
      );
    }
  }

  /**
   * Calculate cache hit rate (simplified - would need request tracking in production)
   */
  private calculateHitRate(): number {
    // This is a simplified implementation
    // In production, you'd track hits vs misses
    return this.cache.size > 0 ? 0.85 : 0; // Placeholder
  }

  /**
   * Destroy the cache and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
export const permissionCache = new PermissionCache();

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("exit", () => {
    permissionCache.destroy();
  });
}
