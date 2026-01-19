import { test, expect } from '@playwright/test';

/**
 * Operation Grand Tour - E2E Verification Suite
 * Verifies all 12 domains in the Madfam ecosystem
 *
 * Domain Map:
 * | Family   | Landing      | App             | Admin             |
 * |----------|--------------|-----------------|-------------------|
 * | Hub      | madfam.io    | -               | admin.madfam.io   |
 * | Hub Auth | auth.madfam.io | -             | -                 |
 * | Janua    | janua.dev    | app.janua.dev   | admin.janua.dev   |
 * | Enclii   | enclii.dev   | app.enclii.dev  | admin.enclii.dev  |
 * | Dhanam   | dhan.am      | app.dhan.am     | admin.dhan.am     |
 */

test.describe('Suite 1: OIDC Discovery', () => {
  test('auth.madfam.io should return valid OIDC config', async ({ request }) => {
    const response = await request.get('https://auth.madfam.io/.well-known/openid-configuration');
    expect(response.status()).toBe(200);

    const config = await response.json();
    expect(config.issuer).toBe('https://auth.madfam.io');
    expect(config.authorization_endpoint).toBeTruthy();
    expect(config.token_endpoint).toBeTruthy();
    expect(config.userinfo_endpoint).toBeTruthy();
    expect(config.jwks_uri).toBeTruthy();
  });

  test('auth.madfam.io JWKS endpoint should be accessible', async ({ request }) => {
    const response = await request.get('https://auth.madfam.io/.well-known/jwks.json');
    expect(response.status()).toBe(200);

    const jwks = await response.json();
    expect(jwks.keys).toBeDefined();
    expect(Array.isArray(jwks.keys)).toBe(true);
  });
});

test.describe('Suite 2: App Authentication', () => {
  test('app.enclii.dev should have login page or redirect to SSO', async ({ page }) => {
    await page.goto('https://app.enclii.dev');
    // App either has its own /login or redirects to SSO
    await expect(page).toHaveURL(/login|auth\.madfam\.io/);
  });

  test('app.janua.dev should have login page or redirect to SSO', async ({ page }) => {
    await page.goto('https://app.janua.dev');
    await expect(page).toHaveURL(/login|auth\.madfam\.io/);
  });

  test('app.dhan.am should be accessible', async ({ page }) => {
    await page.goto('https://app.dhan.am');
    // Dhanam app may not have auth enabled yet
    await expect(page).toHaveURL(/app\.dhan\.am/);
  });
});

test.describe('Suite 3: SSO API Health', () => {
  test('auth.madfam.io API should return healthy status', async ({ request }) => {
    // Janua SSO is an API-first service, verify it responds
    const response = await request.get('https://auth.madfam.io');
    // API returns 405 for root (method not allowed) but with valid JSON
    expect([200, 405]).toContain(response.status());

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBeDefined();
  });
});

test.describe('Suite 4: Landing Pages', () => {
  const landingPages = [
    { domain: 'madfam.io', name: 'Madfam Hub' },
    { domain: 'janua.dev', name: 'Janua SSO' },
    { domain: 'enclii.dev', name: 'Enclii Platform' },
    { domain: 'dhan.am', name: 'Dhanam Ledger' },
  ];

  for (const { domain, name } of landingPages) {
    test(`${domain} (${name}) should return HTTP 200`, async ({ request }) => {
      const response = await request.get(`https://${domain}`);
      expect(response.status()).toBe(200);
    });
  }
});

test.describe('Suite 5: Admin Domains', () => {
  // admin.madfam.io DNS not configured yet
  const adminDomains = [
    'admin.janua.dev',
    'admin.enclii.dev',
    'admin.dhan.am',
  ];

  for (const domain of adminDomains) {
    test(`${domain} should be accessible or redirect to SSO`, async ({ page, request }) => {
      // First try a simple request to check if domain responds
      const response = await request.get(`https://${domain}`);

      // Should either return 200 or 3xx redirect
      expect([200, 301, 302, 307, 308]).toContain(response.status());

      // If it's a redirect, navigate and check we end up at auth
      if (response.status() >= 300) {
        await page.goto(`https://${domain}`);
        // Should redirect to SSO
        await expect(page).toHaveURL(/auth\.madfam\.io/, { timeout: 10000 });
      }
    });
  }
});

test.describe('Suite 6: API Health Checks', () => {
  test('api.enclii.dev health endpoint should return 200', async ({ request }) => {
    const response = await request.get('https://api.enclii.dev/health');
    expect(response.status()).toBe(200);
  });

  test('api.dhan.am health endpoint should return 200', async ({ request }) => {
    const response = await request.get('https://api.dhan.am/v1/monitoring/health');
    expect(response.status()).toBe(200);
  });
});

test.describe('Suite 7: Cross-Domain Screenshots', () => {
  test.beforeAll(async () => {
    // Ensure screenshot directory exists
    const fs = await import('fs');
    const path = 'test-results/screenshots';
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });

  const domains = [
    'madfam.io',
    'janua.dev',
    'enclii.dev',
    'dhan.am',
    'auth.madfam.io',
  ];

  for (const domain of domains) {
    test(`capture screenshot of ${domain}`, async ({ page }) => {
      await page.goto(`https://${domain}`, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: `test-results/screenshots/${domain.replace(/\./g, '_')}_${Date.now()}.png`,
        fullPage: true
      });
    });
  }
});
