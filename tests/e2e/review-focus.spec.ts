import { expect, test } from '@playwright/test';
import { LOCALES, collectErrors, inViewport, passLoader, skipIntroForContext } from './helpers';

test('nav-links-land-on-sections', async ({ page }) => {
  test.setTimeout(120_000);
  await skipIntroForContext(page);
  await page.goto('/');
  await passLoader(page);
  // every same-page nav link that is shown at this width (chapter links collapse on small screens)
  const links = page.locator('header nav a[href^="#"]');
  const hrefs: string[] = [];
  for (const a of await links.all()) if (await a.isVisible()) hrefs.push((await a.getAttribute('href'))!);
  expect(hrefs.length).toBeGreaterThan(0);

  // in a jumbled order, so links are followed from mid-page and backwards too
  const order = [...hrefs.slice(1).reverse(), ...hrefs];
  for (const href of order) {
    await page.locator(`header nav a[href="${href}"]:visible`).first().click();
    await page.waitForTimeout(1_500);
    const id = href.slice(1);
    const heading = id === 'top' ? `#${id} h1` : `#${id} h2`;
    expect(await inViewport(page, heading), `${href} → ${heading} in viewport and visible`).toBe(true);
    // nothing covering it (not under the fixed nav, no stuck overlay)
    const hit = await page.evaluate((sel) => {
      const el = document.querySelector(sel)!;
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + Math.min(20, r.width / 2), r.top + r.height / 2);
      return !!top && (el === top || el.contains(top));
    }, heading);
    expect(hit, `${heading} is not covered`).toBe(true);
  }
});

test('menu-reaches-sections-on-small-screens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'the chapter links are inline at desktop width');
  await skipIntroForContext(page);
  await page.goto('/');
  await passLoader(page);
  const button = page.locator('.menu-btn');
  await expect(button).toBeVisible();
  const box = (await button.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(button).toHaveAttribute('aria-expanded', 'false');

  // Escape closes and focus returns to the button
  await button.click();
  const panel = page.locator('#nav-menu');
  await expect(panel).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(button).toBeFocused();

  // a link in the menu lands on its section and closes the menu
  await button.click();
  await panel.locator('a[href="#contact"]').click();
  await expect(panel).toBeHidden();
  await page.waitForTimeout(1_500);
  expect(await inViewport(page, '#contact h2'), '#contact h2 in viewport').toBe(true);

  // and from mid-page back up to another chapter
  await button.click();
  await panel.locator('a[href="#agents"]').click();
  await page.waitForTimeout(1_500);
  expect(await inViewport(page, '#agents h2'), '#agents h2 in viewport').toBe(true);
});

test('resize-no-horizontal-overflow', async ({ page }) => {
  await skipIntroForContext(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await passLoader(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await page.waitForTimeout(500);

  const check = async (w: number) => {
    await page.setViewportSize({ width: w, height: w > 600 ? 900 : 844 });
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      innerWidth: window.innerWidth,
      canvas: document.querySelector<HTMLCanvasElement>('.stage canvas')?.getBoundingClientRect().width ?? null,
    }));
    expect(m.scrollWidth, `at ${w}px`).toBeLessThanOrEqual(m.innerWidth);
    expect(m.bodyScrollWidth, `body at ${w}px`).toBeLessThanOrEqual(m.innerWidth);
    // the canvas follows the viewport
    if (m.canvas !== null) expect(Math.abs(m.canvas - m.innerWidth), `canvas at ${w}px`).toBeLessThanOrEqual(1);
  };
  for (const w of [1440, 390, 1440]) await check(w);
});

test('storage-blocked', async ({ page }) => {
  await page.addInitScript(() => {
    for (const k of ['getItem', 'setItem', 'removeItem', 'clear', 'key'] as const) {
      Object.defineProperty(Storage.prototype, k, {
        configurable: true,
        value() {
          throw new DOMException('blocked', 'SecurityError');
        },
      });
    }
  });
  const errors = collectErrors(page);
  await page.goto('/');
  // the loader runs (nothing remembered) and can still be passed
  await passLoader(page);
  const html = page.locator('html');
  const before = await html.getAttribute('data-mode');
  await page.locator('button.mode').click();
  await expect(html).not.toHaveAttribute('data-mode', before!);
  await page.locator('.lang a[hreflang="de"]').click();
  await expect(page).toHaveURL(/\/de\/$/);
  await expect(html).toHaveAttribute('lang', 'de');
  await passLoader(page);
  await expect(page.locator('h1')).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('locales-fit-on-phone', async ({ page }) => {
  await skipIntroForContext(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const l of LOCALES) {
    await page.goto(l.path);
    await passLoader(page);
    await page.evaluate(() => document.fonts.ready);
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('h1, h2, .cta, nav a')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || el.getClientRects().length === 0) continue;
        const r = el.getBoundingClientRect();
        const text = (el.textContent ?? '').trim().slice(0, 40);
        if (el.scrollWidth > el.clientWidth + 1) out.push(`${el.tagName}.${el.className} "${text}" scrollWidth ${el.scrollWidth} > ${el.clientWidth}`);
        if (r.left < -1 || r.right > innerWidth + 1) out.push(`${el.tagName}.${el.className} "${text}" box ${r.left.toFixed(0)}–${r.right.toFixed(0)} outside 0–${innerWidth}`);
      }
      if (document.documentElement.scrollWidth > innerWidth) out.push(`page scrollWidth ${document.documentElement.scrollWidth}`);
      return out;
    });
    expect(bad, `${l.code}:\n${bad.join('\n')}`).toEqual([]);
  }
});
