/**
 * Circuit breaker states following the standard pattern
 */
export enum CircuitState {
  /** Normal operation - requests pass through */
  CLOSED = 'CLOSED',
  /** Failing - requests are blocked */
  OPEN = 'OPEN',
  /** Testing recovery - limited requests allowed */
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Health status of the Janua service
 */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
}

/**
 * Configuration for the circuit breaker
 */
export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before attempting recovery */
  resetTimeout: number;
  /** Request timeout in ms */
  requestTimeout: number;
  /** Number of successful requests needed to close circuit from half-open */
  successThreshold: number;
}

/**
 * Configuration for token caching
 */
export interface TokenCacheConfig {
  /** Time-to-live for cached tokens in ms */
  ttl: number;
  /** Maximum number of tokens to cache */
  maxSize: number;
  /** Whether to use cached tokens when circuit is open */
  useCacheOnFailure: boolean;
}

/**
 * Configuration for health monitoring
 */
export interface HealthMonitorConfig {
  /** Interval between health checks in ms */
  checkInterval: number;
  /** Health check endpoint URL */
  healthEndpoint: string;
  /** Timeout for health check requests in ms */
  timeout: number;
}

/**
 * Complete configuration for the resilient auth client
 */
export interface ResilientAuthConfig {
  /** Base URL for Janua API */
  januaBaseUrl: string;
  /** Circuit breaker configuration */
  circuitBreaker: CircuitBreakerConfig;
  /** Token cache configuration */
  tokenCache: TokenCacheConfig;
  /** Health monitor configuration */
  healthMonitor: HealthMonitorConfig;
}

/**
 * Cached token entry
 */
export interface CachedToken {
  token: string;
  expiresAt: number;
  userId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Authentication request
 */
export interface AuthRequest {
  userId: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Authentication response from Janua
 */
export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result of an auth operation that may use cache
 */
export interface AuthResult {
  success: boolean;
  token?: string;
  fromCache: boolean;
  error?: string;
  circuitState: CircuitState;
  healthStatus: HealthStatus;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: number;
  responseTime?: number;
  error?: string;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalRequests: number;
  totalFailures: number;
}
