/**
 * @madfam/analytics/next
 * Next.js specific utilities for PostHog integration
 */

'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { analytics } from './index';

// ============================================
// Page View Tracking for App Router
// ============================================

function PageViewTrackerInner(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Construct URL with search params
      let url = pathname;
      if (searchParams?.toString()) {
        url = `${pathname}?${searchParams.toString()}`;
      }

      analytics.pageView(undefined, {
        page_path: pathname,
        page_url: url,
        search_params: Object.fromEntries(searchParams?.entries() || []),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Component to track page views in Next.js App Router
 * Add this to your root layout
 */
export function PageViewTracker(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}

// ============================================
// PostHog Script Component
// ============================================

interface PostHogScriptProps {
  apiKey: string;
  apiHost?: string;
}

/**
 * Script component for loading PostHog in Next.js
 * Can be used in _document.tsx or layout.tsx
 */
export function getPostHogScriptContent({ apiKey, apiHost }: PostHogScriptProps): string {
  return `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${apiKey}', {
      api_host: '${apiHost || 'http://localhost:8100'}',
      capture_pageview: false,
      capture_pageleave: true,
    });
  `;
}

// ============================================
// Server-Side Utilities
// ============================================

/**
 * Get PostHog config for client-side hydration
 * Use this in getServerSideProps or generateMetadata
 */
export function getPostHogConfig(): {
  apiKey: string;
  apiHost: string;
} {
  return {
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'http://localhost:8100',
  };
}

// ============================================
// Re-exports
// ============================================

export {
  AnalyticsProvider,
  useAnalytics,
  usePageView,
  useIdentifyUser,
  useFeatureFlag,
  useFeatureFlagVariant,
  useExperiment,
  useTrackClick,
  TrackClick,
  FeatureFlag,
  Experiment,
  MADFAM_EVENTS,
} from './react';

export type { AnalyticsConfig, UserIdentity, MadfamEvent } from './index';
