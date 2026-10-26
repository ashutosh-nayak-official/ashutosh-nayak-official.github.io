import { expect, test, type Page } from '@playwright/test';
import { CHAPTER_IDS, EMAIL, attachShot, collectErrors, skipIntroForContext, waitForApp } from './helpers';

const SCENES = ['top', 'call', 'agents', 'infra', 'contact'] as const;

/** Each scene slot shows its still, loaded (not a broken image). */
async function expectStills(page: Page) {
  for (const id of SCENES) {
    const img = page.locator(`#${id} img.scene-still`).first();
    await img.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { timeout: 10_000 })
      .toBe(true);
    await expect(img).toHaveAttribute('alt', '');
  }
}

/** Every heading, paragraph and link in <main> is rendered and fully opaque once scrolled to. */
async function expectTextReadable(page: Page) {
  // let the intro reveal (finite CSS transitions) finish first
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  for (const id of CHAPTER_IDS) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
    const hidden = await page.evaluate((id) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(`#${id} :is(h1, h2, h3, p, li, a)`)) {
        if (el.closest('[aria-hidden="true"], .sr-only')) continue;
        if (!el.textContent?.trim()) continue;
        let opacity = 1;
        for (let n: Element | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (opacity < 0.75 || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) {
          out.push(`${el.tagName} "${el.textContent.trim().slice(0, 40)}" opacity=${opacity.toFixed(2)}`);
        }
      }
      return out;
    }, id);
    expect(hidden, `#${id}:\n${hidden.join('\n')}`).toEqual([]);
  }
}

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('reduced motion: no canvas, stills shown, all text readable', async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await waitForApp(page);
    await expect(page.locator('html')).toHaveAttribute('data-capability', 'static');
    // no intro either
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'ready');
    await expect(page.locator('.loader')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expectStills(page);
    await expectTextReadable(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await attachShot(page, testInfo, `${testInfo.project.name}-reduced-motion-top`);
    // still no canvas after scrolling everything into view
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test('WebGL disabled (--disable-gpu --disable-webgl): stills shown', async ({ playwright, baseURL }, testInfo) => {
  // Launch args need their own browser; keep the project's device settings.
  const browser = await playwright.chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-3d-apis'] });
  const { viewport, isMobile, hasTouch, userAgent, deviceScaleFactor } = testInfo.project.use;
  const context = await browser.newContext({ baseURL, viewport, isMobile, hasTouch, userAgent, deviceScaleFactor });
  try {
    const page = await context.newPage();
    const errors = collectErrors(page);
    await page.goto('/');
    expect(await page.evaluate(() => !!document.createElement('canvas').getContext('webgl'))).toBe(false);
    await waitForApp(page);
    await expect(page.locator('html')).toHaveAttribute('data-capability', 'static');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'ready');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expectStills(page);
    await expectTextReadable(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await attachShot(page, testInfo, `${testInfo.project.name}-webgl-off-top`);
    expect(errors, errors.join('\n')).toEqual([]);
  } finally {
    await browser.close();
  }
});

test('WebGL context lost at runtime: the stage drops to stills', async ({ page }) => {
  await skipIntroForContext(page);
  await page.goto('/');
  await waitForApp(page);
  await expect(page.locator('html')).toHaveAttribute('data-capability', /full|lite/);
  const canvas = page.locator('.stage canvas');
  await expect(canvas).toHaveCount(1, { timeout: 20_000 });
  const lost = await canvas.evaluate((c: HTMLCanvasElement) => {
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    const ext = gl?.getExtension('WEBGL_lose_context');
    ext?.loseContext();
    return !!ext;
  });
  expect(lost, 'WEBGL_lose_context available').toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-capability', 'static');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expectStills(page);
});

test.describe('JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('JavaScript disabled: every chapter heading and the contact email are visible', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const headings = page.locator('main h2');
    expect(await headings.count()).toBeGreaterThanOrEqual(7);
    for (const h of await headings.all()) {
      await h.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); // html is scroll-behavior: smooth
      await expect(h).toBeVisible();
      const opacity = await h.evaluate((el) => {
        let o = 1;
        for (let n: Element | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      });
      expect(opacity, await h.innerText()).toBeGreaterThan(0.99);
    }
    const email = page.locator(`#contact a[href="mailto:${EMAIL}"]`);
    await email.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(email).toBeVisible();
    await expect(email).toContainText(EMAIL);
    // and nothing is left covering the page
    await expect(page.locator('.loader')).toBeHidden();
    await attachShot(page, testInfo, `${testInfo.project.name}-no-js-contact`);
  });
});
