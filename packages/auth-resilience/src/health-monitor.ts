import { HealthStatus, HealthMonitorConfig, HealthCheckResult } from './types.js';

/**
 * Monitors Janua service health with periodic checks.
 *
 * Provides real-time health status to inform circuit breaker
 * and caching decisions.
 */
export class HealthMonitor {
  private status: HealthStatus = HealthStatus.HEALTHY;
  private lastCheck?: HealthCheckResult;
  private checkInterval?: ReturnType<typeof setInterval>;
  private listeners: ((status: HealthStatus) => void)[] = [];

  constructor(private config: HealthMonitorConfig) {}

  /**
   * Start periodic health monitoring
   */
  start(): void {
    if (this.checkInterval) {
      return;
    }

    this.performHealthCheck();

    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);
  }

  /**
   * Stop periodic health monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Perform a single health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.healthEndpoint, {
        signal: controller.signal,
        method: 'GET',
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      let newStatus: HealthStatus;

      if (response.ok) {
        newStatus = HealthStatus.HEALTHY;
      } else if (response.status >= 500) {
        newStatus = HealthStatus.UNHEALTHY;
      } else {
        newStatus = HealthStatus.DEGRADED;
      }

      this.lastCheck = {
        status: newStatus,
        timestamp: Date.now(),
        responseTime,
      };

      this.updateStatus(newStatus);

      return this.lastCheck;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.lastCheck = {
        status: HealthStatus.UNHEALTHY,
        timestamp: Date.now(),
        error: errorMessage,
      };

      this.updateStatus(HealthStatus.UNHEALTHY);

      return this.lastCheck;
    }
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    return this.status;
  }

  /**
   * Get last health check result
   */
  getLastCheck(): HealthCheckResult | undefined {
    return this.lastCheck;
  }

  /**
   * Subscribe to health status changes
   */
  onStatusChange(listener: (status: HealthStatus) => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(newStatus: HealthStatus): void {
    if (newStatus !== this.status) {
      this.status = newStatus;
      this.listeners.forEach(listener => listener(newStatus));
    }
  }

  /**
   * Check if service is healthy enough for operations
   */
  isHealthy(): boolean {
    return this.status === HealthStatus.HEALTHY;
  }

  /**
   * Check if service is degraded
   */
  isDegraded(): boolean {
    return this.status === HealthStatus.DEGRADED;
  }

  /**
   * Check if service is unhealthy
   */
  isUnhealthy(): boolean {
    return this.status === HealthStatus.UNHEALTHY;
  }
}
