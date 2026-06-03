import { act, fireEvent, render, screen } from '@testing-library/react';

import { DEFAULT_ECOSYSTEM_PLATFORMS, EcosystemBanner } from '../index';

const STORAGE_KEY = 'madfam_ecosystem_banner';

describe('EcosystemBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Default render', () => {
    it('mounts and shows the first platform pair', () => {
      render(<EcosystemBanner />);
      const first = DEFAULT_ECOSYSTEM_PLATFORMS[0]!;
      expect(screen.getByText(`${first.keyword}:`)).toBeInTheDocument();
      expect(screen.getByText(first.name)).toBeInTheDocument();
    });

    it('renders the link with target=_blank + rel=noopener and the platform url', () => {
      render(<EcosystemBanner />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('href', DEFAULT_ECOSYSTEM_PLATFORMS[0]!.url);
    });

    it('shows the full keyword:name pair as a title attribute for hover preview', () => {
      render(<EcosystemBanner />);
      const link = screen.getByRole('link');
      const expected = `${DEFAULT_ECOSYSTEM_PLATFORMS[0]!.keyword}: ${DEFAULT_ECOSYSTEM_PLATFORMS[0]!.name}`;
      expect(link).toHaveAttribute('title', expected);
    });

    it('exposes a polite ARIA live region', () => {
      render(<EcosystemBanner />);
      const live = document.querySelector('[aria-live="polite"]');
      expect(live).not.toBeNull();
      expect(live).toHaveAttribute('aria-atomic', 'true');
    });

    it('renders dismiss button with proper aria-label', () => {
      render(<EcosystemBanner />);
      const dismiss = screen.getByRole('button', {
        name: /dismiss madfam ecosystem ticker/i,
      });
      expect(dismiss).toBeInTheDocument();
    });
  });

  describe('Cycling', () => {
    it('advances to the next platform after lingerMs + fade', () => {
      render(<EcosystemBanner lingerMs={1000} />);
      const first = DEFAULT_ECOSYSTEM_PLATFORMS[0]!;
      const second = DEFAULT_ECOSYSTEM_PLATFORMS[1]!;
      expect(screen.getByText(first.name)).toBeInTheDocument();
      // linger + fade window
      act(() => {
        vi.advanceTimersByTime(1000); // linger -> trigger fade
        vi.advanceTimersByTime(280); // fade-out -> swap to next
      });
      expect(screen.getByText(second.name)).toBeInTheDocument();
    });

    it('wraps around to the start after the last platform', () => {
      const platforms = DEFAULT_ECOSYSTEM_PLATFORMS.slice(0, 2);
      render(<EcosystemBanner platforms={platforms} lingerMs={500} />);
      // tick through both transitions back to index 0
      act(() => {
        vi.advanceTimersByTime(500);
        vi.advanceTimersByTime(280);
      });
      expect(screen.getByText(platforms[1]!.name)).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(500);
        vi.advanceTimersByTime(280);
      });
      expect(screen.getByText(platforms[0]!.name)).toBeInTheDocument();
    });

    it('does not cycle when only one platform is supplied', () => {
      const single = [DEFAULT_ECOSYSTEM_PLATFORMS[0]!];
      render(<EcosystemBanner platforms={single} lingerMs={200} />);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText(single[0]!.name)).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('hides the banner when dismiss is clicked and writes versioned record to localStorage', () => {
      render(<EcosystemBanner />);
      const dismiss = screen.getByRole('button', {
        name: /dismiss madfam ecosystem ticker/i,
      });
      fireEvent.click(dismiss);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.v).toBe(2);
      expect(typeof parsed.dismissed_at).toBe('number');
    });

    it('does not render if a recent dismissal exists for the current banner version', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, dismissed_at: Date.now() }));
      render(<EcosystemBanner />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('re-renders if the dismissal is older than 30 days', () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 2, dismissed_at: thirtyOneDaysAgo })
      );
      render(<EcosystemBanner />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('re-renders if the stored banner version differs from current', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 0, dismissed_at: Date.now() }));
      render(<EcosystemBanner />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('forceVisible bypasses dismissal checks', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, dismissed_at: Date.now() }));
      render(<EcosystemBanner forceVisible />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Defensive behaviour', () => {
    it('renders nothing when given an empty platform list', () => {
      const { container } = render(<EcosystemBanner platforms={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('filters out malformed platform entries', () => {
      const platforms = [
        { keyword: '', name: 'Bad', url: 'https://bad.example' },
        DEFAULT_ECOSYSTEM_PLATFORMS[0]!,
      ];
      render(<EcosystemBanner platforms={platforms} />);
      // First valid entry is at original index 0 (the good one)
      expect(screen.getByText(DEFAULT_ECOSYSTEM_PLATFORMS[0]!.name)).toBeInTheDocument();
    });

    it('survives a localStorage failure without throwing', () => {
      const original = window.localStorage.setItem;
      window.localStorage.setItem = () => {
        throw new Error('quota');
      };
      render(<EcosystemBanner />);
      const dismiss = screen.getByRole('button', {
        name: /dismiss madfam ecosystem ticker/i,
      });
      expect(() => fireEvent.click(dismiss)).not.toThrow();
      // banner is still hidden after click despite the storage failure
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      window.localStorage.setItem = original;
    });
  });

  describe('platform list invariants', () => {
    it('keeps the default live platform count explicit', () => {
      expect(DEFAULT_ECOSYSTEM_PLATFORMS).toHaveLength(13);
    });

    it('every default platform has a non-empty keyword, name, and https url', () => {
      for (const p of DEFAULT_ECOSYSTEM_PLATFORMS) {
        expect(p.keyword.length).toBeGreaterThan(0);
        expect(p.name.length).toBeGreaterThan(0);
        expect(p.url).toMatch(/^https:\/\//);
      }
    });

    it('uses the canonical Forge Sight landing domain', () => {
      const forgesight = DEFAULT_ECOSYSTEM_PLATFORMS.find((p) => p.name === 'Forgesight');
      expect(forgesight?.url).toBe('https://forgesight.quest');
    });
  });

  describe('Packaged styles', () => {
    it('ships scoped CSS so consumers do not need Tailwind content scanning', () => {
      render(<EcosystemBanner />);
      const style = document.querySelector('style');
      expect(style?.textContent).toContain('.madfam-eco-banner');
      expect(style?.textContent).toContain('prefers-reduced-motion');
    });
  });
});
