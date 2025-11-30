# @madfam/auth-resilience

Resilient authentication client for the MADFAM ecosystem with circuit breaker pattern and graceful degradation when Janua is unavailable.

## Problem

Janua is the central authentication platform for 11+ apps in the MADFAM ecosystem. If Janua goes down, all apps lose authentication capability, causing a complete ecosystem outage.

## Solution

This package provides a resilient authentication layer that:

- **Circuit Breaker Pattern**: Prevents cascading failures by stopping requests to unhealthy services
- **Token Caching**: Allows existing users to continue working with cached tokens when Janua is down
- **Health Monitoring**: Continuously checks Janua health to inform routing decisions
- **Graceful Degradation**: Rejects new auth requests cleanly while preserving existing sessions
- **Automatic Recovery**: Detects when Janua is healthy and resumes normal operation

## Installation

```bash
pnpm add @madfam/auth-resilience
```

## Quick Start

```typescript
import { ResilientAuthClient } from '@madfam/auth-resilience';

const authClient = new ResilientAuthClient({
  januaBaseUrl: 'https://janua.madfam.io',
});

// Start health monitoring
authClient.start();

// Authenticate a user
const result = await authClient.authenticate({
  userId: 'user123',
  credentials: {
    email: 'user@example.com',
    password: 'secret'
  }
});

if (result.success) {
  console.log('Authenticated:', result.token);
  console.log('From cache:', result.fromCache);
  console.log('Circuit state:', result.circuitState);
}

// Verify a token
const verifyResult = await authClient.verifyToken('user123', token);

// Get metrics
const metrics = authClient.getMetrics();
console.log('Circuit state:', metrics.circuit.state);
console.log('Cache size:', metrics.cache.size);
```

## Circuit Breaker States

| State | Description |
|-------|-------------|
| **CLOSED** | Normal operation, requests pass through |
| **OPEN** | Too many failures, requests blocked, cached tokens used |
| **HALF_OPEN** | Testing recovery, limited requests allowed |

## Configuration

```typescript
const authClient = new ResilientAuthClient({
  januaBaseUrl: 'https://janua.madfam.io',
  
  circuitBreaker: {
    failureThreshold: 5,      // Open after 5 failures
    resetTimeout: 60000,      // Wait 60s before testing recovery
    requestTimeout: 5000,     // Timeout requests after 5s
    successThreshold: 2,      // Need 2 successes to close circuit
  },
  
  tokenCache: {
    ttl: 3600000,            // Cache tokens for 1 hour
    maxSize: 1000,           // Store up to 1000 tokens
    useCacheOnFailure: true, // Use cache when circuit is open
  },
  
  healthMonitor: {
    checkInterval: 30000,    // Check health every 30s
    healthEndpoint: 'https://janua.madfam.io/health',
    timeout: 3000,           // Health check timeout: 3s
  },
});
```

## Behavior Under Failure

| Scenario | Behavior |
|----------|----------|
| Janua healthy | Normal auth flow, tokens cached |
| Janua unhealthy | Circuit opens, cached tokens served |
| No cached token | Graceful failure with clear error |
| Janua recovers | Circuit closes, normal flow resumes |

## License

MIT © 2025 MADFAM
