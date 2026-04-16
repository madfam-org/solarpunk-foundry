'use client';

import { useEffect } from 'react';
import type { ErrorBoundaryMessages } from './ErrorBoundary';

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  messages?: Record<string, ErrorBoundaryMessages>;
  fallbackHref?: string;
  fallbackLabel?: string;
}

const DEFAULT_MESSAGES: Record<string, ErrorBoundaryMessages> = {
  es: {
    title: 'Algo salio mal',
    message: 'Ocurrio un error inesperado. Intenta de nuevo.',
    retry: 'Reintentar',
  },
  en: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    retry: 'Retry',
  },
};

function getPreferredLang(supportedLangs: string[]): string {
  if (typeof window === 'undefined') return supportedLangs[0] ?? 'es';
  try {
    const stored = localStorage.getItem('preferred-lang');
    if (stored && supportedLangs.includes(stored)) return stored;
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && supportedLangs.includes(browserLang)) return browserLang;
    return supportedLangs[0] ?? 'es';
  } catch {
    return supportedLangs[0] ?? 'es';
  }
}

export function RouteError({
  error,
  reset,
  messages,
  fallbackHref,
  fallbackLabel,
}: RouteErrorProps) {
  useEffect(() => {
    import('@madfam/sentry')
      .then((mod) => {
        const capture = mod.captureError ?? mod.captureException;
        if (typeof capture === 'function') {
          capture(error);
        }
      })
      .catch(() => {
        // @madfam/sentry not installed — silent fallback
      });
  }, [error]);

  const msgs = messages ?? DEFAULT_MESSAGES;
  const lang = getPreferredLang(Object.keys(msgs));
  const t = msgs[lang] ?? Object.values(msgs)[0];

  if (!t) return null;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        {t.title}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {t.message}
      </p>
      {error.digest && (
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          Digest: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {t.retry}
        </button>
        {fallbackHref && (
          <a
            href={fallbackHref}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {fallbackLabel ?? 'Go back'}
          </a>
        )}
      </div>
    </div>
  );
}
