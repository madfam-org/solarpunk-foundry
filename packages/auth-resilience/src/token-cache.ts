import { CachedToken, TokenCacheConfig } from './types.js';

/**
 * LRU cache for authentication tokens with TTL support.
 *
 * Provides fallback authentication when Janua is unavailable,
 * allowing existing users to continue working with cached tokens.
 */
export class TokenCache {
  private cache = new Map<string, CachedToken>();
  private accessOrder: string[] = [];

  constructor(private config: TokenCacheConfig) {}

  /**
   * Store a token in the cache
   */
  set(userId: string, token: string, expiresIn: number, metadata?: Record<string, unknown>): void {
    const expiresAt = Date.now() + expiresIn;

    this.cache.set(userId, {
      token,
      expiresAt,
      userId,
      metadata,
    });

    this.updateAccessOrder(userId);
    this.enforceMaxSize();
  }

  /**
   * Retrieve a token from the cache
   */
  get(userId: string): string | null {
    const cached = this.cache.get(userId);

    if (!cached) {
      return null;
    }

    if (this.isExpired(cached)) {
      this.cache.delete(userId);
      this.removeFromAccessOrder(userId);
      return null;
    }

    this.updateAccessOrder(userId);
    return cached.token;
  }

  /**
   * Get full cached token entry
   */
  getEntry(userId: string): CachedToken | null {
    const cached = this.cache.get(userId);

    if (!cached) {
      return null;
    }

    if (this.isExpired(cached)) {
      this.cache.delete(userId);
      this.removeFromAccessOrder(userId);
      return null;
    }

    this.updateAccessOrder(userId);
    return cached;
  }

  /**
   * Check if a token exists and is valid
   */
  has(userId: string): boolean {
    return this.get(userId) !== null;
  }

  /**
   * Remove a token from the cache
   */
  delete(userId: string): void {
    this.cache.delete(userId);
    this.removeFromAccessOrder(userId);
  }

  /**
   * Clear all cached tokens
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      validTokens: entries.filter(e => !this.isExpired(e)).length,
      expiredTokens: entries.filter(e => this.isExpired(e)).length,
      oldestExpiry: entries.length > 0
        ? Math.min(...entries.map(e => e.expiresAt - now))
        : null,
    };
  }

  /**
   * Check if a cached token is expired
   */
  private isExpired(cached: CachedToken): boolean {
    return Date.now() >= cached.expiresAt;
  }

  /**
   * Update access order for LRU eviction
   */
  private updateAccessOrder(userId: string): void {
    this.removeFromAccessOrder(userId);
    this.accessOrder.push(userId);
  }

  /**
   * Remove from access order
   */
  private removeFromAccessOrder(userId: string): void {
    const index = this.accessOrder.indexOf(userId);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize) {
      const lruUserId = this.accessOrder.shift();
      if (lruUserId) {
        this.cache.delete(lruUserId);
      }
    }
  }

  /**
   * Remove expired tokens (maintenance operation)
   */
  pruneExpired(): number {
    let pruned = 0;
    const now = Date.now();

    for (const [userId, cached] of this.cache.entries()) {
      if (now >= cached.expiresAt) {
        this.cache.delete(userId);
        this.removeFromAccessOrder(userId);
        pruned++;
      }
    }

    return pruned;
  }
}
