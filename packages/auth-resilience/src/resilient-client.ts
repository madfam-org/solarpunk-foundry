import { CircuitBreaker } from './circuit-breaker.js';
import { TokenCache } from './token-cache.js';
import { HealthMonitor } from './health-monitor.js';
import {
  ResilientAuthConfig,
  AuthRequest,
  AuthResponse,
  AuthResult,
  CircuitState,
} from './types.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ResilientAuthConfig = {
  januaBaseUrl: 'https://janua.madfam.io',
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    requestTimeout: 5000,
    successThreshold: 2,
  },
  tokenCache: {
    ttl: 3600000,
    maxSize: 1000,
    useCacheOnFailure: true,
  },
  healthMonitor: {
    checkInterval: 30000,
    healthEndpoint: 'https://janua.madfam.io/health',
    timeout: 3000,
  },
};

/**
 * Resilient authentication client for MADFAM ecosystem.
 *
 * Provides circuit breaker protection, token caching, and graceful
 * degradation when Janua is unavailable. Designed to keep ecosystem
 * apps running even when central auth is down.
 *
 * @example
 * ```typescript
 * const client = new ResilientAuthClient({
 *   januaBaseUrl: 'https://janua.madfam.io',
 * });
 *
 * client.start();
 *
 * const result = await client.authenticate({
 *   userId: 'user123',
 *   credentials: { email: 'user@example.com', password: 'secret' }
 * });
 *
 * if (result.success) {
 *   console.log('Token:', result.token);
 *   console.log('From cache:', result.fromCache);
 * }
 * ```
 */
export class ResilientAuthClient {
  private circuitBreaker: CircuitBreaker;
  private tokenCache: TokenCache;
  private healthMonitor: HealthMonitor;
  private config: ResilientAuthConfig;

  constructor(config: Partial<ResilientAuthConfig> = {}) {
    this.config = this.mergeConfig(config);

    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.tokenCache = new TokenCache(this.config.tokenCache);
    this.healthMonitor = new HealthMonitor(this.config.healthMonitor);
  }

  /**
   * Start health monitoring
   */
  start(): void {
    this.healthMonitor.start();
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    this.healthMonitor.stop();
  }

  /**
   * Authenticate a user, with circuit breaker protection and caching
   */
  async authenticate(request: AuthRequest): Promise<AuthResult> {
    const circuitState = this.circuitBreaker.getState();

    if (circuitState === CircuitState.OPEN) {
      return this.handleCircuitOpen(request);
    }

    try {
      const response = await this.circuitBreaker.execute(() =>
        this.callJanuaAuth(request)
      );

      this.tokenCache.set(
        request.userId,
        response.token,
        response.expiresIn,
        response.metadata
      );

      return {
        success: true,
        token: response.token,
        fromCache: false,
        circuitState: this.circuitBreaker.getState(),
        healthStatus: this.healthMonitor.getStatus(),
      };
    } catch (error) {
      return this.handleAuthFailure(request, error);
    }
  }

  /**
   * Verify a token (checks cache first, then Janua if needed)
   */
  async verifyToken(userId: string, token: string): Promise<AuthResult> {
    const cachedToken = this.tokenCache.get(userId);

    if (cachedToken === token) {
      return {
        success: true,
        token,
        fromCache: true,
        circuitState: this.circuitBreaker.getState(),
        healthStatus: this.healthMonitor.getStatus(),
      };
    }

    if (this.circuitBreaker.getState() === CircuitState.OPEN) {
      return {
        success: false,
        fromCache: false,
        error: 'Circuit breaker open and token not in cache',
        circuitState: CircuitState.OPEN,
        healthStatus: this.healthMonitor.getStatus(),
      };
    }

    try {
      await this.circuitBreaker.execute(() =>
        this.callJanuaVerify(userId, token)
      );

      return {
        success: true,
        token,
        fromCache: false,
        circuitState: this.circuitBreaker.getState(),
        healthStatus: this.healthMonitor.getStatus(),
      };
    } catch (error) {
      return {
        success: false,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Verification failed',
        circuitState: this.circuitBreaker.getState(),
        healthStatus: this.healthMonitor.getStatus(),
      };
    }
  }

  /**
   * Invalidate a cached token
   */
  invalidateToken(userId: string): void {
    this.tokenCache.delete(userId);
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics() {
    return {
      circuit: this.circuitBreaker.getMetrics(),
      cache: this.tokenCache.getStats(),
      health: this.healthMonitor.getLastCheck(),
    };
  }

  /**
   * Subscribe to health status changes
   */
  onHealthChange(listener: (status: string) => void) {
    return this.healthMonitor.onStatusChange(listener);
  }

  /**
   * Handle circuit breaker in OPEN state
   */
  private handleCircuitOpen(request: AuthRequest): AuthResult {
    if (this.config.tokenCache.useCacheOnFailure) {
      const cachedToken = this.tokenCache.get(request.userId);

      if (cachedToken) {
        return {
          success: true,
          token: cachedToken,
          fromCache: true,
          circuitState: CircuitState.OPEN,
          healthStatus: this.healthMonitor.getStatus(),
        };
      }
    }

    return {
      success: false,
      fromCache: false,
      error: 'Janua unavailable and no cached token available',
      circuitState: CircuitState.OPEN,
      healthStatus: this.healthMonitor.getStatus(),
    };
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(request: AuthRequest, error: unknown): AuthResult {
    if (this.config.tokenCache.useCacheOnFailure) {
      const cachedToken = this.tokenCache.get(request.userId);

      if (cachedToken) {
        return {
          success: true,
          token: cachedToken,
          fromCache: true,
          circuitState: this.circuitBreaker.getState(),
          healthStatus: this.healthMonitor.getStatus(),
        };
      }
    }

    return {
      success: false,
      fromCache: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      circuitState: this.circuitBreaker.getState(),
      healthStatus: this.healthMonitor.getStatus(),
    };
  }

  /**
   * Call Janua authentication API
   */
  private async callJanuaAuth(request: AuthRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.config.januaBaseUrl}/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Janua auth failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Call Janua token verification API
   */
  private async callJanuaVerify(userId: string, token: string): Promise<void> {
    const response = await fetch(`${this.config.januaBaseUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Token verification failed: ${response.status}`);
    }
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(config: Partial<ResilientAuthConfig>): ResilientAuthConfig {
    return {
      januaBaseUrl: config.januaBaseUrl ?? DEFAULT_CONFIG.januaBaseUrl,
      circuitBreaker: {
        ...DEFAULT_CONFIG.circuitBreaker,
        ...config.circuitBreaker,
      },
      tokenCache: {
        ...DEFAULT_CONFIG.tokenCache,
        ...config.tokenCache,
      },
      healthMonitor: {
        ...DEFAULT_CONFIG.healthMonitor,
        ...config.healthMonitor,
      },
    };
  }
}
