import { test, expect } from '@playwright/test';

test('full SSO login flow on app.enclii.dev', async ({ page }) => {
  // Increase test timeout
  test.setTimeout(60000);

  console.log('Step 1: Navigate to app.enclii.dev');
  await page.goto('https://app.enclii.dev');

  // Wait for "Checking session..." to disappear - this can take a while
  console.log('Step 2: Waiting for session check to complete...');
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Checking session'),
    { timeout: 30000 }
  );

  console.log('Step 3: Session check complete, current URL:', page.url());
  await page.screenshot({ path: 'test-results/sso_step1_after_session_check.png', fullPage: true });

  // Now look for the SSO button
  console.log('Step 4: Looking for SSO button...');
  const ssoButton = page.locator('button').filter({ hasText: /sign in|janua|sso/i }).first();

  await ssoButton.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Step 5: Found SSO button, clicking...');
  await page.screenshot({ path: 'test-results/sso_step2_before_click.png', fullPage: true });
  await ssoButton.click();

  // Wait for redirect to Janua
  console.log('Step 6: Waiting for redirect to auth.madfam.io...');
  await page.waitForURL(/auth\.madfam\.io/, { timeout: 20000 });
  console.log('Step 7: On Janua SSO page:', page.url());
  await page.screenshot({ path: 'test-results/sso_step3_janua_login.png', fullPage: true });

  // Wait for Janua login form
  console.log('Step 8: Looking for login form...');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"], input[name="username"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });

  console.log('Step 9: Filling credentials on Janua...');
  await emailInput.fill('admin@madfam.io');

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.fill(process.env.E2E_TEST_PASSWORD || '');

  await page.screenshot({ path: 'test-results/sso_step4_filled_form.png' });

  // Submit
  console.log('Step 10: Submitting login form...');
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  // Wait for consent screen
  console.log('Step 11: Waiting for OAuth consent screen...');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/sso_step5_after_submit.png', fullPage: true });

  // Check for consent screen - look for "Allow" button
  const allowButton = page.locator('button').filter({ hasText: /^Allow$/i }).first();

  if (await allowButton.isVisible({ timeout: 5000 })) {
    console.log('Step 12: Found consent screen, clicking Allow...');
    await allowButton.click();
    console.log('Step 12b: Clicked Allow button');
  } else {
    console.log('Step 12: No consent screen or already approved');
  }

  // Wait for redirect to callback and then to app
  console.log('Step 13: Waiting for OAuth callback and redirect...');
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('Step 14: Current URL:', currentUrl);
  await page.screenshot({ path: 'test-results/sso_step6_after_consent.png', fullPage: true });

  // The callback redirects to app.enclii.dev - wait for it
  try {
    await page.waitForURL(/app\.enclii\.dev/, { timeout: 20000 });
    console.log('Step 15: Successfully redirected to app.enclii.dev');
  } catch (e) {
    console.log('Step 15: Redirect timeout. Current URL:', page.url());
    await page.screenshot({ path: 'test-results/sso_step7_timeout.png', fullPage: true });
  }

  // Final screenshot
  console.log('Step 16: Final URL:', page.url());
  await page.screenshot({ path: 'test-results/sso_step8_final.png', fullPage: true });

  // Verify we're on Enclii
  expect(page.url()).toMatch(/app\.enclii\.dev/);

  // Check we're logged in - should see dashboard content, not login page
  const pageContent = await page.textContent('body');
  console.log('Step 17: Page content preview:', pageContent?.substring(0, 500));

  // Verify we're not on login page anymore
  expect(pageContent).not.toContain('Sign in with Janua SSO');
});
