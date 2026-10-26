import { expect, type Page, type TestInfo } from '@playwright/test';

export const LOCALES = [
  { code: 'en', path: '/' },
  { code: 'de', path: '/de/' },
  { code: 'nl', path: '/nl/' },
  { code: 'pl', path: '/pl/' },
] as const;

/** Every chapter section on the page, in order. */
export const CHAPTER_IDS = ['top', 'production', 'call', 'agents', 'infra', 'work', 'path', 'contact'] as const;

export const EMAIL = 'ashutosh.nayak.formal@gmail.com';

/** Collects console errors and uncaught page errors from the moment it is attached. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()} @ ${m.location().url}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Wait for hydration: the stage env sets html[data-capability] right after mount. */
export async function waitForApp(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-capability', /full|lite|static/);
}

/** Get past the assembly loader (skip it with a key press if it is running). */
export async function passLoader(page: Page): Promise<void> {
  await waitForApp(page);
  const intro = await page.locator('html').getAttribute('data-intro');
  if (intro === 'loading' || intro === 'pending') await page.keyboard.press('Shift');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'ready');
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 5_000 });
}

/** Mark the intro as seen for this context so the loader does not run. */
export async function skipIntroForContext(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('ge-intro-seen', '1');
    } catch {
      /* storage blocked */
    }
  });
}

/** Scroll a chapter into view (its top for pinned ones, centred otherwise) and let it settle. */
export async function showChapter(page: Page, id: string): Promise<void> {
  await page.evaluate((id) => {
    const el = document.getElementById(id)!;
    const r = el.getBoundingClientRect();
    const pinned = el.classList.contains('chapter--pinned');
    // pinned chapters: halfway through the sticky range, so the scene is mid-story
    const extra = pinned ? Math.max(0, (r.height - innerHeight) / 2) : 0;
    window.scrollTo(0, Math.max(0, scrollY + r.top + extra));
  }, id);
  await page.waitForTimeout(700);
}

export async function attachShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await testInfo.attach(name, { body: await page.screenshot(), contentType: 'image/png' });
}

/** Is the whole box of `el` inside the viewport (vertically) and visible? */
export async function inViewport(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // effective opacity: the element and every ancestor
    let opacity = 1;
    for (let n: Element | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
    return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && cs.visibility !== 'hidden' && opacity > 0.5;
  }, selector);
}
