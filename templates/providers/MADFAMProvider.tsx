'use client';

/**
 * MADFAM Universal Provider
 *
 * Combines all MADFAM ecosystem integrations into a single provider:
 * - Janua SSO (authentication)
 * - MADFAM Analytics (telemetry)
 * - Coforma Feedback (customer advisory board)
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

import { type ReactNode } from 'react';
import { JanuaProvider, type JanuaConfig } from '@janua/react-sdk';
import { AnalyticsProvider } from '@madfam/analytics';
import { CoformaProvider, type CoformaConfig } from '@coforma/client/react';

// Environment-based configuration
const januaConfig: JanuaConfig = {
  apiUrl: process.env.NEXT_PUBLIC_JANUA_API_URL || 'https://auth.madfam.io',
  clientId: process.env.NEXT_PUBLIC_JANUA_CLIENT_ID || '',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
};

const analyticsConfig = {
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'madfam.io',
  apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io',
  enabled: process.env.NODE_ENV === 'production',
};

interface MADFAMProviderProps {
  children: ReactNode;
  productId: string;
  disableAnalytics?: boolean;
  disableCoforma?: boolean;
  disableJanua?: boolean;
}

export function MADFAMProvider({
  children,
  productId,
  disableAnalytics = false,
  disableCoforma = false,
  disableJanua = false,
}: MADFAMProviderProps) {
  const coformaConfig: CoformaConfig = {
    baseUrl: process.env.NEXT_PUBLIC_COFORMA_API_URL || 'https://api.coforma.studio',
    apiKey: process.env.NEXT_PUBLIC_COFORMA_API_KEY || '',
    tenantId: process.env.NEXT_PUBLIC_COFORMA_TENANT_ID || 'madfam',
    productId,
  };

  // Build provider tree based on what's enabled
  let content = children;

  // Coforma (innermost - for feedback widget)
  if (!disableCoforma && coformaConfig.apiKey) {
    content = (
      <CoformaProvider config={coformaConfig}>
        {content}
      </CoformaProvider>
    );
  }

  // Analytics (middle layer)
  if (!disableAnalytics) {
    content = (
      <AnalyticsProvider config={analyticsConfig}>
        {content}
      </AnalyticsProvider>
    );
  }

  // Janua SSO (outermost - for authentication)
  if (!disableJanua && januaConfig.clientId) {
    content = (
      <JanuaProvider config={januaConfig}>
        {content}
      </JanuaProvider>
    );
  }

  return <>{content}</>;
}

// Re-export hooks for convenience
export { useJanua, useAuth, useSession } from '@janua/react-sdk';
export { useAnalytics, trackEvent } from '@madfam/analytics';
export { useCoforma, useProductFeedback, useSubmitFeedback } from '@coforma/client/react';

// Type exports
export type { JanuaConfig } from '@janua/react-sdk';
export type { CoformaConfig } from '@coforma/client/react';
