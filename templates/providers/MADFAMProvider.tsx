'use client';

/**
 * MADFAM Universal Provider (template — copy into your app, then adapt)
 *
 * Updated 2026-09-23 to the ecosystem contracts in solarpunk-foundry README §IV:
 *
 * - Janua SSO is NOT a React provider here. MADFAM Next.js apps authenticate with
 *   `@madfam/janua-next` middleware (or the Auth.js `janua` provider), configured
 *   server-side from `AUTH_JANUA_ISSUER` / `AUTH_JANUA_CLIENT_ID` /
 *   `AUTH_JANUA_CLIENT_SECRET`. See docs/JANUA_INTEGRATION.md. Nothing Janua-related
 *   belongs in a `NEXT_PUBLIC_*` variable.
 * - Analytics is the Plausible template in templates/analytics/analytics.ts, copied to
 *   `src/lib/analytics.ts`. It sends to the ONE self-hosted host,
 *   `https://plausible.madfam.io`, and never falls back to Plausible Cloud: a Cloud
 *   host is refused and analytics stays OFF (fail closed — no beacon).
 * - Service API keys never reach the browser. The Coforma client talks to your app's
 *   own `/api/coforma` route handler, which adds `COFORMA_API_KEY` server-side.
 *
 * Usage:
 * ```tsx
 * import { MADFAMProvider } from '@/providers/MADFAMProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <MADFAMProvider productId="your-product-id">
 *       {children}
 *     </MADFAMProvider>
 *   );
 * }
 * ```
 */

import { type ReactNode, useEffect } from 'react';
import type { ProductId } from '@madfam/core';
import { CoformaProvider, type CoformaConfig } from '@coforma/client/react';
// The copied template (templates/analytics/analytics.ts), not a package.
import { initializeAnalytics } from '@/lib/analytics';

const analyticsDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '';

interface MADFAMProviderProps {
  children: ReactNode;
  productId: ProductId;
  disableAnalytics?: boolean;
  disableCoforma?: boolean;
}

export function MADFAMProvider({
  children,
  productId,
  disableAnalytics = false,
  disableCoforma = false,
}: MADFAMProviderProps) {
  const coformaConfig: CoformaConfig = {
    // Your app's server-side proxy; it injects COFORMA_API_KEY and forwards to
    // COFORMA_API_URL. The browser never holds the key.
    baseUrl: '/api/coforma',
    apiKey: '',
    tenantId: process.env.NEXT_PUBLIC_COFORMA_TENANT_ID || 'madfam',
    productId,
  };

  // Analytics: only in production and only with a domain. The host is fixed inside
  // src/lib/analytics.ts; a Plausible Cloud host is refused there.
  useEffect(() => {
    if (disableAnalytics || process.env.NODE_ENV !== 'production' || !analyticsDomain) return;
    initializeAnalytics({ domain: analyticsDomain, appId: productId });
  }, [disableAnalytics, productId]);

  let content = children;

  // Coforma (innermost - for the feedback widget)
  if (!disableCoforma) {
    content = <CoformaProvider config={coformaConfig}>{content}</CoformaProvider>;
  }

  return <>{content}</>;
}

// Re-export hooks for convenience
export { useAnalytics } from '@/lib/analytics';
export { useCoforma, useProductFeedback, useSubmitFeedback } from '@coforma/client/react';

// Type exports
export type { CoformaConfig } from '@coforma/client/react';
