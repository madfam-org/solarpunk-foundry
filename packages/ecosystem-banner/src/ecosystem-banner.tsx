'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_ECOSYSTEM_PLATFORMS, type EcosystemPlatform } from './platforms';

/**
 * Schema-versioned dismissal record. Bump `BANNER_VERSION` when the platform
 * list materially changes so users see the new lineup even if previously
 * dismissed.
 */
const STORAGE_KEY = 'madfam_ecosystem_banner';
const BANNER_VERSION = 1;
const DISMISS_DAYS = 30;
const LINGER_MS_DEFAULT = 4000;
const FADE_MS = 280;

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
      className={[
        // Fixed bottom, full-width, very small height.
        'fixed inset-x-0 bottom-0 z-40',
        // Brand-neutral chrome.
        'bg-slate-900/95 text-slate-100',
        'border-t border-slate-800 backdrop-blur-sm',
        // Entry animation: fade + slide-up 4px on first paint only.
        'animate-[ecosystemBannerIn_300ms_ease-out_both]',
        className ?? '',
      ].join(' ')}
      style={{
        // Keep the banner clear of the iOS home-indicator on mobile.
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <style>{`
        @keyframes ecosystemBannerIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mx-auto flex h-7 max-w-screen-2xl items-center gap-2 px-3 text-[11px] leading-none sm:text-xs">
        <span
          aria-hidden="true"
          className="hidden shrink-0 rounded-sm bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:inline-block"
        >
          {label}
        </span>

        <span aria-hidden="true" className="hidden text-slate-600 sm:inline">
          /
        </span>

        {/*
          Live region: announces each platform pair to screen readers without
          interrupting (polite). We give it a stable container and swap inner
          content so AT can pick up updates reliably.
        */}
        <div aria-live="polite" aria-atomic="true" className="min-w-0 flex-1 truncate">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            title={fullPair}
            className={[
              'inline-flex items-baseline gap-1.5 transition-opacity duration-200',
              'text-slate-100 hover:text-white hover:underline underline-offset-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:rounded-sm',
              fading ? 'opacity-0' : 'opacity-100',
              // prefers-reduced-motion: still fades (no transform) — by design.
              'motion-reduce:transition-none',
            ].join(' ')}
          >
            <span className="font-mono uppercase tracking-wide text-slate-400">
              {current.keyword}:
            </span>
            <span className="font-semibold">{current.name}</span>
            <span aria-hidden="true" className="ml-1 text-slate-500">
              ↗
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss MADFAM ecosystem ticker"
          className={[
            // 44x44 touch target via padding; visual glyph is ~16px.
            'relative -mr-1 flex h-11 w-11 shrink-0 items-center justify-center',
            'sm:h-7 sm:w-7',
            'text-slate-400 hover:text-slate-100 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:rounded-sm',
          ].join(' ')}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
