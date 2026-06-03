'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_ECOSYSTEM_PLATFORMS, type EcosystemPlatform } from './platforms';

/**
 * Schema-versioned dismissal record. Bump `BANNER_VERSION` when the platform
 * list materially changes so users see the new lineup even if previously
 * dismissed.
 */
const STORAGE_KEY = 'madfam_ecosystem_banner';
const BANNER_VERSION = 3;
const DISMISS_DAYS = 30;
const LINGER_MS_DEFAULT = 4000;
const FADE_MS = 280;

const BANNER_STYLES = `
  @keyframes ecosystemBannerIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .madfam-eco-banner {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 40;
    background: rgb(15 23 42 / 95%);
    color: rgb(241 245 249);
    border-top: 1px solid rgb(30 41 59);
    backdrop-filter: blur(4px);
    animation: ecosystemBannerIn 300ms ease-out both;
    padding-bottom: env(safe-area-inset-bottom, 0);
    box-sizing: border-box;
  }

  .madfam-eco-banner *,
  .madfam-eco-banner *::before,
  .madfam-eco-banner *::after {
    box-sizing: border-box;
  }

  .madfam-eco-banner__inner {
    width: 100%;
    max-width: 1536px;
    height: 28px;
    margin-inline: auto;
    padding-inline: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    line-height: 1;
  }

  .madfam-eco-banner__label {
    display: none;
    flex-shrink: 0;
    border-radius: 2px;
    background: rgb(30 41 59);
    padding: 2px 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .025em;
    color: rgb(148 163 184);
    white-space: nowrap;
  }

  .madfam-eco-banner__separator {
    display: none;
    color: rgb(71 85 105);
  }

  .madfam-eco-banner__live {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .madfam-eco-banner__link {
    display: inline-flex;
    max-width: 100%;
    align-items: baseline;
    gap: 6px;
    color: rgb(241 245 249);
    text-decoration: none;
    opacity: 1;
    transition: opacity 200ms ease, color 150ms ease;
    vertical-align: baseline;
  }

  .madfam-eco-banner__link:hover {
    color: rgb(255 255 255);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .madfam-eco-banner__link:focus-visible,
  .madfam-eco-banner__dismiss:focus-visible {
    outline: 2px solid rgb(148 163 184);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .madfam-eco-banner__link--fading {
    opacity: 0;
  }

  .madfam-eco-banner__keyword {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    text-transform: uppercase;
    letter-spacing: .025em;
    color: rgb(148 163 184);
  }

  .madfam-eco-banner__name {
    flex-shrink: 0;
    font-weight: 600;
  }

  .madfam-eco-banner__external {
    margin-left: 4px;
    color: rgb(100 116 139);
  }

  .madfam-eco-banner__dismiss {
    position: relative;
    margin-right: -4px;
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    padding: 0;
    background: transparent;
    color: rgb(148 163 184);
    cursor: pointer;
    transition: color 150ms ease;
    font: inherit;
  }

  .madfam-eco-banner__dismiss:hover {
    color: rgb(241 245 249);
  }

  .madfam-eco-banner__dismiss-glyph {
    font-size: 16px;
    line-height: 1;
  }

  @media (min-width: 640px) {
    .madfam-eco-banner__inner {
      font-size: 12px;
    }

    .madfam-eco-banner__label,
    .madfam-eco-banner__separator {
      display: inline-block;
    }

    .madfam-eco-banner__dismiss {
      width: 28px;
      height: 28px;
      flex-basis: 28px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .madfam-eco-banner,
    .madfam-eco-banner__link,
    .madfam-eco-banner__dismiss {
      animation: none;
      transition: none;
    }
  }
`;

interface DismissalRecord {
  v: number;
  dismissed_at: number;
}

function readDismissal(): DismissalRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DismissalRecord>;
    if (typeof parsed.dismissed_at !== 'number' || typeof parsed.v !== 'number') return null;
    return parsed as DismissalRecord;
  } catch {
    return null;
  }
}

function isStillDismissed(record: DismissalRecord | null): boolean {
  if (!record) return false;
  if (record.v !== BANNER_VERSION) return false;
  const ageMs = Date.now() - record.dismissed_at;
  return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export interface EcosystemBannerProps {
  /** Override the platform list (e.g. show only a subset on a niche landing). */
  platforms?: readonly EcosystemPlatform[];
  /** How long each pair lingers before transitioning, in ms. Default 4000. */
  lingerMs?: number;
  /** Optional className for the outer fixed wrapper. */
  className?: string;
  /** Override host display label (defaults to "MADFAM ECOSYSTEM"). */
  label?: string;
  /** Optional test id for host-app E2E selectors. */
  testId?: string;
  /** Force-render even if dismissed — useful for previews/Storybook. */
  forceVisible?: boolean;
}

/**
 * MADFAM Ecosystem Banner — sticky, very small, NYSE-style ticker.
 *
 * - Renders one `[KEYWORD]: [PLATFORM NAME]` pair at a time, cycling on a
 *   `lingerMs` cadence with a soft cross-fade.
 * - Respects `prefers-reduced-motion`: fades only (default behaviour anyway —
 *   we never horizontally scroll) and keeps cadence identical so screen
 *   readers receive predictable updates via `aria-live="polite"`.
 * - Dismissible. Dismissal persists 30 days in `localStorage` keyed by
 *   `BANNER_VERSION`; bump the version constant to force re-display after a
 *   meaningful lineup change.
 * - Brand-neutral chrome (slate-900 bg, slate-100 text) so it does not clash
 *   with embedding landings.
 */
export function EcosystemBanner({
  platforms = DEFAULT_ECOSYSTEM_PLATFORMS,
  lingerMs = LINGER_MS_DEFAULT,
  className,
  label = 'MADFAM ECOSYSTEM',
  testId,
  forceVisible = false,
}: EcosystemBannerProps) {
  // Stable list — we filter empty/invalid entries defensively so a downstream
  // typo doesn't render a blank ticker.
  const list = useMemo(() => platforms.filter((p) => p.keyword && p.name && p.url), [platforms]);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SSR-safe visibility check.
  useEffect(() => {
    setMounted(true);
    if (forceVisible) {
      setVisible(true);
      return;
    }
    if (list.length === 0) return;
    const dismissed = isStillDismissed(readDismissal());
    setVisible(!dismissed);
  }, [forceVisible, list.length]);

  // Cycle through platforms.
  useEffect(() => {
    if (!visible || list.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setFading(true);
      fadeTimerRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % list.length);
        setFading(false);
      }, FADE_MS);
    }, lingerMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [visible, list.length, lingerMs]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      const record: DismissalRecord = { v: BANNER_VERSION, dismissed_at: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // localStorage unavailable (private mode, quota) — banner stays hidden
      // for this session, which is the user's intent.
    }
  }, []);

  if (!mounted || !visible || list.length === 0) return null;

  const current = list[index]!;
  const fullPair = `${current.keyword}: ${current.name}`;

  return (
    <div
      role="complementary"
      aria-label="MADFAM ecosystem ticker"
      data-testid={testId}
      className={[
        'madfam-eco-banner',
        className ?? '',
      ].join(' ')}
    >
      <style>{BANNER_STYLES}</style>
      <div className="madfam-eco-banner__inner">
        <span aria-hidden="true" className="madfam-eco-banner__label">
          {label}
        </span>

        <span aria-hidden="true" className="madfam-eco-banner__separator">
          /
        </span>

        {/*
          Live region: announces each platform pair to screen readers without
          interrupting (polite). We give it a stable container and swap inner
          content so AT can pick up updates reliably.
        */}
        <div aria-live="polite" aria-atomic="true" className="madfam-eco-banner__live">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            title={fullPair}
            className={[
              'madfam-eco-banner__link',
              fading ? 'madfam-eco-banner__link--fading' : '',
            ].join(' ')}
          >
            <span className="madfam-eco-banner__keyword">
              {current.keyword}:
            </span>
            <span className="madfam-eco-banner__name">{current.name}</span>
            <span aria-hidden="true" className="madfam-eco-banner__external">
              ↗
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss MADFAM ecosystem ticker"
          className="madfam-eco-banner__dismiss"
        >
          <span aria-hidden="true" className="madfam-eco-banner__dismiss-glyph">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
