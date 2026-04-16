'use client';

import { useEffect } from 'react';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Drop-in component for Next.js `app/global-error.tsx`.
 *
 * Uses raw Tailwind utility classes (no CSS custom properties)
 * because global-error renders outside the theme provider.
 */
export function GlobalError({ error, reset }: GlobalErrorProps) {
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

  return (
    <html lang="es">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#09090b',
            color: '#fafafa',
          }}
        >
          <h2
            style={{
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#a1a1aa',
            }}
          >
            A critical error occurred. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: '#71717a',
                fontFamily: 'monospace',
              }}
            >
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: '0.375rem',
              backgroundColor: '#fafafa',
              color: '#09090b',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
