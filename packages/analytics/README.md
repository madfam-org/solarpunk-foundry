# @madfam/analytics

Shared PostHog instrumentation for the MADFAM ecosystem.

## Installation

```bash
pnpm add @madfam/analytics
```

## Quick Start

### Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { AnalyticsProvider } from '@madfam/analytics/react';
import { PageViewTracker } from '@madfam/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        siteId: 'madfam', // or 'madfam' or 'primavera3d'
        environment: process.env.NODE_ENV as 'development' | 'production',
      }}
    >
      <PageViewTracker />
      {children}
    </AnalyticsProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=http://localhost:8100
```

## Usage

### Track Events

```tsx
import { useAnalytics, MADFAM_EVENTS } from '@madfam/analytics/react';

function MyComponent() {
  const { track, trackCTA } = useAnalytics();

  return (
    <button
      onClick={() => {
        trackCTA('get-started', { location: 'hero' });
      }}
    >
      Get Started
    </button>
  );
}
```

### Feature Flags

```tsx
import { useFeatureFlag, FeatureFlag } from '@madfam/analytics/react';

// Hook
function MyComponent() {
  const showNewFeature = useFeatureFlag('new-feature-flag');
  
  if (showNewFeature) {
    return <NewFeature />;
  }
  return <OldFeature />;
}

// Component
function MyPage() {
  return (
    <FeatureFlag flag="new-feature" fallback={<OldFeature />}>
      <NewFeature />
    </FeatureFlag>
  );
}
```

### A/B Testing

```tsx
import { useExperiment, Experiment } from '@madfam/analytics/react';

// Hook
function HeroSection() {
  const { variant, trackConversion } = useExperiment('hero-experiment');

  const handleSignup = () => {
    trackConversion('signup_clicked');
    // ... signup logic
  };

  if (variant === 'variant-a') {
    return <HeroA onSignup={handleSignup} />;
  }
  return <HeroB onSignup={handleSignup} />;
}

// Component
function LandingPage() {
  return (
    <Experiment
      experimentKey="landing-hero"
      variants={{
        control: <HeroControl />,
        'variant-a': <HeroVariantA />,
        'variant-b': <HeroVariantB />,
      }}
      fallback={<HeroControl />}
    />
  );
}
```

### Identify Users

```tsx
import { useIdentifyUser } from '@madfam/analytics/react';

function AuthProvider({ user, children }) {
  // Automatically identifies user when logged in
  useIdentifyUser(user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.subscription?.plan,
  } : null);

  return children;
}
```

### Track Quote/Checkout (Primavera3D)

```tsx
import { useAnalytics } from '@madfam/analytics/react';

function QuoteForm() {
  const { track } = useAnalytics();

  const handleQuoteStart = () => {
    track('quote_started', {
      material: selectedMaterial,
      estimated_volume: volume,
    });
  };

  const handleQuoteComplete = (quote) => {
    track('quote_completed', {
      quote_id: quote.id,
      total_price: quote.totalPrice,
      currency: 'MXN',
    });
  };

  // ...
}
```

## Standard Events

| Event | Description |
|-------|-------------|
| `page_view` | Page viewed |
| `cta_clicked` | CTA button clicked |
| `signup_started` | Signup flow initiated |
| `signup_completed` | Signup successful |
| `pricing_viewed` | Pricing page viewed |
| `pricing_calculator_used` | Calculator interaction |
| `quote_started` | Quote flow started |
| `quote_completed` | Quote generated |
| `checkout_started` | Checkout initiated |
| `payment_completed` | Payment successful |
| `demo_requested` | Demo form submitted |

## Development

PostHog runs locally at `http://localhost:8100`.

Start the observability stack:

```bash
cd solarpunk-foundry/ops/local
./start-observability.sh
```

## License

MIT - MADFAM
