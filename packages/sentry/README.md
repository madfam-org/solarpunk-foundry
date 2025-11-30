# @madfam/sentry

Shared Sentry configuration package for the MADFAM/Solarpunk ecosystem. Provides unified error tracking, performance monitoring, and session replay capabilities for both Node.js and React applications.

## Features

- **Universal Configuration**: Single package for Node.js (NestJS, Express) and React (Next.js) apps
- **Error Sanitization**: Automatic redaction of sensitive data (passwords, tokens, API keys)
- **Performance Monitoring**: Built-in transaction tracking and performance sampling
- **Session Replay**: Capture user sessions for debugging (production-safe with masking)
- **Environment-Aware**: Automatic configuration based on deployment environment
- **Type-Safe**: Full TypeScript support with comprehensive types
- **Error Boundaries**: React error boundary component with Sentry integration
- **Privacy-First**: Sensitive data redaction and configurable sampling rates

## Installation

```bash
pnpm add @madfam/sentry
```

### Peer Dependencies

Install the appropriate Sentry SDK for your application:

**For Node.js applications (NestJS, Express):**
```bash
pnpm add @sentry/node
```

**For React applications:**
```bash
pnpm add @sentry/react
```

**For Next.js applications:**
```bash
pnpm add @sentry/nextjs
```

## Usage

### Node.js / NestJS

```typescript
import { initSentryNode } from '@madfam/sentry/node';

// Initialize Sentry (typically in main.ts or app bootstrap)
await initSentryNode({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  enablePerformance: true,
});

// Use Sentry functions
import { createUserContext, createBreadcrumb } from '@madfam/sentry/node';
import * as Sentry from '@sentry/node';

// Set user context
Sentry.setUser(createUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
}));

// Add breadcrumbs
Sentry.addBreadcrumb(createBreadcrumb({
  message: 'User logged in',
  category: 'auth',
  level: 'info',
  data: { userId: user.id },
}));

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'riskyOperation' },
  });
}
```

### React / Next.js

```typescript
import { initSentryReact, SentryErrorBoundary } from '@madfam/sentry/react';

// Initialize Sentry (typically in _app.tsx or root component)
await initSentryReact({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  enableReplay: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Wrap your app with Error Boundary
function App({ Component, pageProps }) {
  return (
    <SentryErrorBoundary
      fallback={(error, reset) => (
        <div>
          <h1>Application Error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
      showDialog={true}
    >
      <Component {...pageProps} />
    </SentryErrorBoundary>
  );
}
```

### Utility Functions

```typescript
import {
  sanitizeErrorData,
  createUserContext,
  createErrorContext,
  createBreadcrumb,
} from '@madfam/sentry/utils';

// Sanitize sensitive data
const sanitized = sanitizeErrorData({
  user: {
    id: '123',
    email: 'user@example.com',
    password: 'secret123', // Will be redacted
    apiKey: 'sk_test_abc', // Will be redacted
  },
});
// Result: { user: { id: '123', email: 'user@example.com', password: '[REDACTED]', apiKey: '[REDACTED]' } }
```

## Configuration

### Environment Variables

```bash
# Required
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# Optional - for React/Next.js (browser-accessible)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Sampling Rates by Environment

| Environment | Error Sampling | Transaction Sampling | Replay (Error) | Replay (Session) |
|-------------|----------------|---------------------|----------------|------------------|
| production  | 100%           | 10%                 | 100%           | 10%              |
| staging     | 100%           | 50%                 | 0%             | 0%               |
| development | 100%           | 100%                | 0%             | 0%               |

## Sensitive Data Protection

The package automatically redacts common sensitive fields:

- `password`, `token`, `apiKey`, `api_key`
- `secret`, `accessToken`, `access_token`
- `refreshToken`, `refresh_token`
- `authorization`, `cookie`, `csrf`, `xsrf`
- `session`, `sessionId`, `session_id`
- `ssn`, `creditCard`, `credit_card`
- `cardNumber`, `card_number`, `cvv`, `pin`

## License

MIT © MADFAM
