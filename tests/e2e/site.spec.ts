import { expect, test } from '@playwright/test';
import { CHAPTER_IDS, attachShot, collectErrors, passLoader, showChapter, waitForApp } from './helpers';

test('loads with no console errors and screenshots every chapter in dark and light', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await page.goto('/');
  await passLoader(page);
  await expect(page.locator('h1')).toBeVisible();

  for (const mode of ['dark', 'light'] as const) {
    if ((await page.locator('html').getAttribute('data-mode')) !== mode) {
      await page.locator('button.mode').click();
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
    }
    for (const id of CHAPTER_IDS) {
      await showChapter(page, id);
      await expect(page.locator(`#${id} :is(h1, h2)`).first()).toBeAttached();
      await attachShot(page, testInfo, `${testInfo.project.name}-${mode}-${id}`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

test('loader can be skipped and is skipped on reload in the same session', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  const html = page.locator('html');
  // First visit with motion and WebGL: the intro runs, and a click skips it at once
  // (well before the 3.5 s cap).
  await expect(html).toHaveAttribute('data-intro', 'loading');
  await expect(page.locator('.loader')).toBeVisible();
  const t0 = Date.now();
  await page.mouse.click(10, 300);
  await expect(html).toHaveAttribute('data-intro', 'ready', { timeout: 1_000 });
  expect(Date.now() - t0).toBeLessThan(1_000);
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 3_000 });
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('ge-intro-seen'))).toBe('1');

  await page.reload();
  // The inline script never marks the page as pending on a repeat visit.
  expect(await html.getAttribute('data-intro')).not.toBe('pending');
  await waitForApp(page);
  await expect(html).toHaveAttribute('data-intro', 'ready');
  await expect(page.locator('.loader')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});

test('a first visit to a deep link (/#contact) skips the intro', async ({ page }) => {
  await page.goto('/#contact');
  const html = page.locator('html');
  // never marked pending, so the overlay never shows
  await expect(html).toHaveAttribute('data-intro', 'ready', { timeout: 500 });
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 500 });
  await waitForApp(page);
  await expect(page.locator('.loader')).toHaveCount(0);
  await expect(page.locator('.site-nav')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.site-nav')!).opacity)).not.toBe('0');
  expect(await page.evaluate(() => sessionStorage.getItem('ge-intro-seen'))).toBe('1');
});

test('language switch navigates and is remembered', async ({ page }) => {
  await page.goto('/');
  await passLoader(page);
  await page.locator('.lang a[hreflang="de"]').click();
  await expect(page).toHaveURL(/\/de\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('.lang a[aria-current="page"]')).toHaveAttribute('hreflang', 'de');

  // Remembered: the bare root sends the visitor back to German.
  await page.goto('/');
  await expect(page).toHaveURL(/\/de\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  // And switching back to English sticks too.
  await passLoader(page);
  await page.locator('.lang a[hreflang="en"]').click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await page.goto('/');
  await expect(page).toHaveURL(/:\d+\/$/);

  // An explicit locale link is never overridden by the stored locale.
  await page.goto('/pl/');
  await waitForApp(page);
  await expect(page).toHaveURL(/\/pl\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

  // The root redirect keeps the hash.
  await page.evaluate(() => localStorage.setItem('ge-locale', 'de'));
  await page.goto('/#contact');
  await expect(page).toHaveURL(/\/de\/#contact$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('mode toggle persists across reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await passLoader(page);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-mode', 'dark');
  const toggle = page.locator('button.mode');
  const darkLabel = await toggle.getAttribute('aria-label');
  await toggle.click();
  await expect(html).toHaveAttribute('data-mode', 'light');
  await expect(toggle).not.toHaveAttribute('aria-label', darkLabel!);

  await page.reload();
  await expect(html).toHaveAttribute('data-mode', 'light');
  await waitForApp(page);
  await expect(html).toHaveAttribute('data-mode', 'light');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(252, 251, 248)');

  await page.locator('button.mode').click();
  await page.reload();
  await expect(html).toHaveAttribute('data-mode', 'dark');
});

test('3D stage and scroll engine load only after first paint and page load', async ({ page }) => {
  await page.goto('/');
  await passLoader(page);
  await expect(page.locator('.stage canvas')).toHaveCount(1);
  const t = await page.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? NaN;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const late = performance
      .getEntriesByType('resource')
      .filter((r) => /\/assets\/(Stage|events|scrollEngine|\w+Scene)-[\w.-]+\.js$/.test(r.name))
      .map((r) => ({ name: r.name.split('/').pop(), start: r.startTime }));
    return { fcp, loadEnd: nav.loadEventEnd, late };
  });
  expect(t.late.length).toBeGreaterThanOrEqual(3);
  for (const r of t.late) {
    expect(r.start, `${r.name} after first contentful paint`).toBeGreaterThan(t.fcp);
    expect(r.start, `${r.name} after the load event`).toBeGreaterThanOrEqual(t.loadEnd);
  }
});
