# @madfam/core

> Authoritative organizational constants for the MADFAM/Solarpunk ecosystem

This package contains **decisions**, not implementations. It provides the foundational constants that all ecosystem applications MUST use for consistency.

## Philosophy

This package exists because some things should be **authoritative** across the ecosystem:

- Brand identity (colors, fonts) → Every app should look like MADFAM
- Supported locales → Users get consistent language support
- Analytics taxonomy → Cross-app user journeys are trackable
- Legal information → Compliance is consistent

This is fundamentally different from "shared utility code" - these are **organizational decisions** codified as constants.

## Installation

```bash
pnpm add @madfam/core
# or
npm install @madfam/core
```

## Usage

### Brand Identity

```typescript
import { brand, colors, typography, spacing } from '@madfam/core';

// Use in Tailwind config
module.exports = {
  theme: {
    colors: {
      primary: colors.primary,
      semantic: colors.semantic,
    },
    fontFamily: {
      sans: [typography.fonts.body, 'sans-serif'],
      mono: [typography.fonts.mono, 'monospace'],
    },
  },
};

// Use in components
<h1 style={{ color: colors.primary.green }}>{brand.tagline}</h1>
```

### Localization

```typescript
import { 
  locales, 
  defaultLocale, 
  parseLocale, 
  getLocaleMetadata,
  type Locale 
} from '@madfam/core';

// Type-safe locale handling
function setUserLocale(locale: string): Locale {
  return parseLocale(locale); // Returns valid locale or fallback
}

// Get locale metadata
const meta = getLocaleMetadata('es');
console.log(meta.nativeName); // "Español"
console.log(meta.dateFormat); // "DD/MM/YYYY"
```

### Currencies

```typescript
import { 
  currencies, 
  formatCurrency, 
  getCurrencyMetadata,
  type Currency 
} from '@madfam/core';

// Format amounts
formatCurrency(1234.56, 'MXN'); // "$1,234.56"
formatCurrency(1234.56, 'EUR'); // "1,234.56€"

// Get currency info
const mxn = getCurrencyMetadata('MXN');
console.log(mxn.name); // "Mexican Peso"
```

### Analytics Events

```typescript
import { 
  analyticsEvents,
  type AnalyticsEventName,
  type UserSignedUpProps 
} from '@madfam/core';

// Type-safe event tracking (you implement the tracker)
function track<T extends AnalyticsEventName>(
  event: T, 
  props: EventProps<T>
): void {
  // Your Plausible/PostHog/etc implementation
  plausible.trackEvent(event, { props });
}

// Usage with full type safety
track('user.signed_up', {
  app: 'dhanam',
  source: 'organic',
  referralCode: 'FRIEND10',
});
```

### Product Registry

```typescript
import { 
  products, 
  getProduct, 
  getProductsByLayer,
  getProductGitHubUrl,
  type ProductId 
} from '@madfam/core';

// Get product info
const janua = getProduct('janua');
console.log(janua.domain); // "janua.dev"
console.log(janua.license); // "AGPL-3.0"

// Get products by layer
const infrastructure = getProductsByLayer('soil');
// [enclii, janua]

// Generate URLs
getProductGitHubUrl('sim4d'); // "https://github.com/madfam-io/sim4d"
```

### Legal Information

```typescript
import { 
  company, 
  legalUrls, 
  getCopyrightNotice, 
  footerLinks 
} from '@madfam/core';

// Footer component
function Footer() {
  return (
    <footer>
      {footerLinks.legal.map(link => (
        <a key={link.href} href={link.href}>{link.label}</a>
      ))}
      <p>{getCopyrightNotice()}</p>
    </footer>
  );
}
```

## What's Included

| Module | Contents | Purpose |
|--------|----------|---------|
| `brand` | Colors, typography, spacing, shadows | Visual identity |
| `locales` | Supported languages, metadata | Internationalization |
| `currencies` | Supported currencies, formatting | Financial operations |
| `events` | Analytics event taxonomy | Cross-app tracking |
| `products` | Product registry, metadata | Ecosystem awareness |
| `legal` | Company info, legal URLs | Compliance |

## What's NOT Included

This package intentionally does NOT include:

- ❌ UI components (apps own their components)
- ❌ React hooks (apps own their implementations)
- ❌ API clients (apps own their integrations)
- ❌ Utility functions (apps own their helpers)
- ❌ Configuration files (apps own their configs)

## Governance

Changes to this package require governance approval because they affect the entire ecosystem.

**To propose changes:**

1. Open an issue in [solarpunk-foundry](https://github.com/madfam-io/solarpunk-foundry)
2. Discuss with stakeholders
3. Submit PR with governance approval
4. Package is versioned with semver

**Breaking changes** (major version bumps) include:
- Removing colors, locales, or currencies
- Changing event names in the taxonomy
- Modifying legal URLs or company information

## License

MIT © Innovaciones MADFAM SAS de CV
