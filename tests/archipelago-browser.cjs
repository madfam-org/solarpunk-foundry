// Browser proof, 2026-10-29: local public HTML and the exact three.js version
// in its import map. External requests are blocked; no product route is probed.
// This verifies rendering/interaction, not CDN availability or product status.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { once } = require('node:events');
const deps = process.env.ARCHIPELAGO_TEST_DEPS;
if (!deps) throw new Error('ARCHIPELAGO_TEST_DEPS must point to the isolated proof dependencies.');
const { chromium } = require(require.resolve('playwright', { paths: [deps] }));
const vendor = path.resolve(deps, 'node_modules/three');
const out = path.resolve(__dirname, '../artifacts/archipelago');

async function main() {
  await fs.mkdir(out, { recursive: true });
  const html = await fs.readFile(path.resolve(__dirname, '../docs/archipelago/index.html'));
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light',
      });
      const errors = [];
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === origin) return route.continue();
        const prefix = '/npm/three@0.169.0/';
        if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith(prefix)) {
          const file = path.resolve(vendor, url.pathname.slice(prefix.length));
          assert(file.startsWith(vendor + path.sep), 'vendor path must stay inside three.js');
          return route.fulfill({ contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: await fs.readFile(file) });
        }
        return route.abort();
      });
      if (mobile) await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          return String(type).includes('webgl') ? null : original.call(this, type, ...args);
        };
      });
      else await page.addInitScript(() => { window.__ARCH_TEST = true; window.__ARCH_AA = false; });
      try {
        await page.goto(origin, { waitUntil: 'domcontentloaded' });
        if (mobile) {
          await page.locator('#fallback').waitFor({ state: 'visible' });
          await page.locator('#book').waitFor({ state: 'visible' });
        } else {
          await page.waitForFunction(() => window.__ARCH_OK === true);
          assert.equal(await page.locator('#stage canvas').count(), 1, 'real WebGL canvas must mount');
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.screenshot({ path: path.join(out, 'desktop-chart.png') });
        }
        const model = await page.evaluate(() => window.ARCH);
        assert.equal(await page.locator('#list .row').count(), model.islands.length, 'every public island/wreck must be reachable');
        assert(model.islands.some(island => island.id === 'pliego'));
        assert(model.islands.some(island => island.id === 'primavera3d'));
        await page.locator('#search').fill('Cotiza');
        assert.equal(await page.locator('#list .row').count(), 1);
        await page.locator('#list .row').click();
        await page.locator('#card').waitFor({ state: 'visible' });
        assert.match(await page.locator('#card h2').innerText(), /Cotiza/i);
        assert.equal(await page.locator('#card a[href*="github.com"]').count(), 0, 'private repository links must stay absent');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        assert.equal(overflow, false, 'mobile/desktop UI must not overflow horizontally');
        if (mobile) {
          assert.equal(await page.locator('#fallback').isVisible(), false, 'failure notice must not cover the selected product');
          assert.equal(await page.locator('#btn-book').getAttribute('aria-expanded'), 'false');
          await page.screenshot({ path: path.join(out, 'mobile-fallback-card.png') });
          assert(errors.length > 0, 'fallback proof must actually reject WebGL');
        } else {
          await page.locator('#btn-night').click();
          assert.equal(await page.locator('#btn-night').getAttribute('aria-pressed'), 'true');
          assert.deepEqual(errors, [], '3D renderer must not throw');
        }
      } catch (error) {
        await page.screenshot({ path: path.join(out, mobile ? 'mobile-failure.png' : 'desktop-failure.png') }).catch(() => {});
        throw error;
      } finally { await context.close(); }
    }
    console.log('Public archipelago browser proof passed: desktop WebGL, complete registry, private-link omission, mobile fallback/search/card, night control.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
