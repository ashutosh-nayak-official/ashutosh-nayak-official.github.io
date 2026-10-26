import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { CHAPTER_IDS, passLoader, showChapter, skipIntroForContext } from './helpers';

// The lockfile resolves @axe-core/playwright's `playwright-core` peer to a newer release
// than @playwright/test bundles; only the Page *types* differ (axe uses evaluate/frames).
type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page'];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const path of ['/', '/de/']) {
  for (const mode of ['dark', 'light'] as const) {
    test(`axe WCAG 2 A/AA: ${path} in ${mode} mode has zero violations`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'tablet', 'a11y runs at desktop and phone');
      await skipIntroForContext(page);
      await page.addInitScript((m) => {
        try {
          localStorage.setItem('ge-mode', m);
        } catch {
          /* storage blocked */
        }
      }, mode);
      await page.goto(path);
      await passLoader(page);
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
      // let fonts and the first scroll measurement settle
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);

      const axe = () => new AxeBuilder({ page: page as unknown as AxePage }).withTags(TAGS);
      const results = await axe().analyze();
      const violations = [...results.violations];
      // Scroll-driven chapters reveal and recolour their copy as they enter: re-check the
      // whole page with each chapter in view, so contrast is judged in its revealed state.
      // The hero was judged above at scroll 0, where it is read; past that its copy fades
      // out by design as the engine breaks apart (transitional, not a reading state).
      for (const id of CHAPTER_IDS.filter((c) => c !== 'top')) {
        await showChapter(page, id);
        const r = await axe().include(`#${id}`).analyze();
        for (const v of r.violations) violations.push({ ...v, id: `${v.id} @#${id}` });
      }
      const summary = violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `  ${n.target.join(' ')} — ${n.failureSummary}`).join('\n')}`,
      );
      await testInfo.attach(`axe-${path.replace(/\//g, '_')}-${mode}.json`, {
        body: JSON.stringify(violations, null, 2),
        contentType: 'application/json',
      });
      expect(summary, summary.join('\n\n')).toEqual([]);
    });
  }
}
