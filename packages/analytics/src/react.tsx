/**
 * @madfam/analytics/react
 * React hooks and components for PostHog integration
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { analytics, type AnalyticsConfig, type UserIdentity } from './index';

// ============================================
// Context
// ============================================

interface AnalyticsContextValue {
  /** Whether analytics is initialized */
  isReady: boolean;
  /** Track an event */
  track: typeof analytics.track;
  /** Track a CTA click */
  trackCTA: typeof analytics.trackCTA;
  /** Identify a user */
  identify: typeof analytics.identify;
  /** Reset user identity */
  reset: typeof analytics.reset;
  /** Check feature flag */
  isFeatureEnabled: typeof analytics.isFeatureEnabled;
  /** Get feature flag value */
  getFeatureFlag: typeof analytics.getFeatureFlag;
  /** Get experiment variant */
  getExperimentVariant: typeof analytics.getExperimentVariant;
  /** Track experiment conversion */
  trackExperimentConversion: typeof analytics.trackExperimentConversion;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface AnalyticsProviderProps {
  children: ReactNode;
  config: AnalyticsConfig;
}

export function AnalyticsProvider({ children, config }: AnalyticsProviderProps): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    analytics.init(config);
    setIsReady(true);

    // Track initial page view
    analytics.pageView();
  }, [config]);

  const value: AnalyticsContextValue = {
    isReady,
    track: analytics.track.bind(analytics),
    trackCTA: analytics.trackCTA.bind(analytics),
    identify: analytics.identify.bind(analytics),
    reset: analytics.reset.bind(analytics),
    isFeatureEnabled: analytics.isFeatureEnabled.bind(analytics),
    getFeatureFlag: analytics.getFeatureFlag.bind(analytics),
    getExperimentVariant: analytics.getExperimentVariant.bind(analytics),
    trackExperimentConversion: analytics.trackExperimentConversion.bind(analytics),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

/**
 * Access analytics context
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}

/**
 * Track page views on route changes
 */
export function usePageView(pageName?: string): void {
  useEffect(() => {
    analytics.pageView(pageName);
  }, [pageName]);
}

/**
 * Identify a user when they log in
 */
export function useIdentifyUser(user: UserIdentity | null): void {
  useEffect(() => {
    if (user) {
      analytics.identify(user);
    }
  }, [user]);
}

/**
 * Use a feature flag
 */
export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkFlag = () => {
      setEnabled(analytics.isFeatureEnabled(flag));
    };

    checkFlag();

    // Re-check when flags reload
    const unsubscribe = analytics.onFeatureFlagsLoaded(checkFlag);
    return unsubscribe;
  }, [flag]);

  return enabled;
}

/**
 * Use a multivariate feature flag
 */
export function useFeatureFlagVariant(flag: string): string | boolean | undefined {
  const [variant, setVariant] = useState<string | boolean | undefined>(undefined);

  useEffect(() => {
    const checkVariant = () => {
      setVariant(analytics.getFeatureFlag(flag));
    };

    checkVariant();

    const unsubscribe = analytics.onFeatureFlagsLoaded(checkVariant);
    return unsubscribe;
  }, [flag]);

  return variant;
}

/**
 * Use an A/B test experiment
 */
export function useExperiment(experimentKey: string): {
  variant: string | undefined;
  trackConversion: (event: string) => void;
} {
  const [variant, setVariant] = useState<string | undefined>(undefined);

  useEffect(() => {
    const v = analytics.getExperimentVariant(experimentKey);
    setVariant(v);
  }, [experimentKey]);

  const trackConversion = useCallback(
    (event: string) => {
      analytics.trackExperimentConversion(experimentKey, event);
    },
    [experimentKey]
  );

  return { variant, trackConversion };
}

/**
 * Track clicks on an element
 */
export function useTrackClick(
  eventName: string,
  properties?: Record<string, unknown>
): (event?: React.MouseEvent) => void {
  return useCallback(
    (event?: React.MouseEvent) => {
      analytics.track(eventName, {
        element_tag: event?.currentTarget?.tagName,
        element_text: event?.currentTarget?.textContent?.substring(0, 100),
        ...properties,
      });
    },
    [eventName, properties]
  );
}

// ============================================
// Components
// ============================================

interface TrackClickProps {
  children: ReactNode;
  event: string;
  properties?: Record<string, unknown>;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wrapper component that tracks clicks
 */
export function TrackClick({
  children,
  event,
  properties,
  as: Component = 'div',
}: TrackClickProps): JSX.Element {
  const handleClick = useTrackClick(event, properties);

  return React.createElement(
    Component,
    { onClick: handleClick },
    children
  );
}

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render based on feature flag
 */
export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps): JSX.Element {
  const enabled = useFeatureFlag(flag);

  return <>{enabled ? children : fallback}</>;
}

interface ExperimentProps {
  experimentKey: string;
  variants: Record<string, ReactNode>;
  fallback?: ReactNode;
}

/**
 * Render different content based on experiment variant
 */
export function Experiment({
  experimentKey,
  variants,
  fallback = null,
}: ExperimentProps): JSX.Element {
  const { variant } = useExperiment(experimentKey);

  if (!variant || !variants[variant]) {
    return <>{fallback}</>;
  }

  return <>{variants[variant]}</>;
}

// ============================================
// Re-exports
// ============================================

export { MADFAM_EVENTS } from './index';
export type { AnalyticsConfig, UserIdentity, MadfamEvent } from './index';
