'use client';

import { Component, type ReactNode } from 'react';

export interface ErrorBoundaryMessages {
  title: string;
  message: string;
  retry: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  messages?: Record<string, ErrorBoundaryMessages>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const DEFAULT_MESSAGES: Record<string, ErrorBoundaryMessages> = {
  es: {
    title: 'Algo salio mal',
    message: 'Ocurrio un error inesperado. Intenta recargar la pagina.',
    retry: 'Reintentar',
  },
  en: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Try reloading the page.',
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

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    import('@madfam/sentry')
      .then((mod) => {
        const capture = mod.captureError ?? mod.captureException;
        if (typeof capture === 'function') {
          capture(error, { componentStack: errorInfo.componentStack });
        }
      })
      .catch(() => {
        // @madfam/sentry not installed — silent fallback
      });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const msgs = this.props.messages ?? DEFAULT_MESSAGES;
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
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            {t.retry}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
