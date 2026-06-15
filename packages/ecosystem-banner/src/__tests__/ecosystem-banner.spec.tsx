import { fireEvent, render, screen } from '@testing-library/react';

import { DEFAULT_ECOSYSTEM_PLATFORMS, EcosystemBanner } from '../index';

const STORAGE_KEY = 'madfam_ecosystem_banner';

describe('EcosystemBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('Default render', () => {
    it('mounts the marquee track with every platform name', () => {
      render(<EcosystemBanner testId="ecosystem-banner" />);
      for (const platform of DEFAULT_ECOSYSTEM_PLATFORMS) {
        expect(screen.getAllByText(platform.name).length).toBeGreaterThanOrEqual(1);
      }
    });

    it('renders links with target=_blank + rel=noopener and platform urls', () => {
      render(<EcosystemBanner />);
      const first = DEFAULT_ECOSYSTEM_PLATFORMS[0]!;
      const link = screen.getAllByRole('link', { name: new RegExp(first.name) })[0]!;
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('href', first.url);
    });

    it('duplicates the track for seamless marquee looping', () => {
      render(<EcosystemBanner platforms={DEFAULT_ECOSYSTEM_PLATFORMS.slice(0, 2)} />);
      expect(screen.getAllByText('Dhanam')).toHaveLength(2);
      expect(screen.getAllByText('Selva')).toHaveLength(2);
    });

    it('renders dismiss button with proper aria-label', () => {
      render(<EcosystemBanner />);
      expect(
        screen.getByRole('button', { name: /dismiss madfam ecosystem ticker/i })
      ).toBeInTheDocument();
    });
  });

  describe('Dismissal', () => {
    it('hides the banner when dismiss is clicked and writes versioned record to localStorage', () => {
      render(<EcosystemBanner />);
      fireEvent.click(screen.getByRole('button', { name: /dismiss madfam ecosystem ticker/i }));
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
      expect(parsed.v).toBe(4);
      expect(typeof parsed.dismissed_at).toBe('number');
    });

    it('does not render if a recent dismissal exists for the current banner version', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 4, dismissed_at: Date.now() }));
      render(<EcosystemBanner />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('re-renders if the stored banner version differs from current', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 0, dismissed_at: Date.now() }));
      render(<EcosystemBanner />);
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    });

    it('forceVisible bypasses dismissal checks', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 4, dismissed_at: Date.now() }));
      render(<EcosystemBanner forceVisible />);
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
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
      expect(screen.getAllByText(DEFAULT_ECOSYSTEM_PLATFORMS[0]!.name).length).toBeGreaterThan(0);
    });
  });

  describe('platform list invariants', () => {
    it('keeps the default live platform count explicit', () => {
      expect(DEFAULT_ECOSYSTEM_PLATFORMS).toHaveLength(13);
    });

    it('uses the canonical Forge Sight landing domain', () => {
      const forgesight = DEFAULT_ECOSYSTEM_PLATFORMS.find((p) => p.name === 'Forge Sight');
      expect(forgesight?.url).toBe('https://forgesight.quest');
    });
  });

  describe('Packaged styles', () => {
    it('ships scoped CSS including marquee animation', () => {
      render(<EcosystemBanner />);
      const style = document.querySelector('style');
      expect(style?.textContent).toContain('.madfam-eco-banner');
      expect(style?.textContent).toContain('ecosystemMarquee');
    });

    it('can expose a host-app test id on the fixed root', () => {
      render(<EcosystemBanner testId="ecosystem-banner" />);
      expect(screen.getByTestId('ecosystem-banner')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('MADFAM ecosystem ticker')
      );
    });
  });
});
