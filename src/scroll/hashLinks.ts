/** Same-page hash-link handling shared by the Lenis and native scroll paths. */

/** The element a same-page `#id` link points at, or null (external, empty or missing target). */
export function hashTarget(a: HTMLAnchorElement): HTMLElement | null {
  const href = a.getAttribute('href');
  if (!href || !href.startsWith('#') || href.length < 2) return null;
  let id: string;
  try {
    id = decodeURIComponent(href.slice(1));
  } catch {
    return null;
  }
  return document.getElementById(id);
}

/**
 * Where focus goes after scrolling to `target`: the target itself if it is already
 * focusable (e.g. `<main tabindex="-1">`), otherwise its first heading, otherwise the
 * target. A heading or target without tabindex gets `tabindex="-1"`.
 */
export function focusTargetFor(target: HTMLElement): HTMLElement {
  if (target.hasAttribute('tabindex')) return target;
  const el = target.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6') ?? target;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  return el;
}

export type ScrollToFn = (target: HTMLElement) => void;

/**
 * Intercept clicks on same-page hash links: scroll with `scrollTo`, update the URL hash
 * without a jump, and move focus to the target heading (with preventScroll, so it never
 * fights the smooth scroll and still lands if the user interrupts it). Returns a cleanup.
 */
export function interceptHashLinks(scrollTo: ScrollToFn): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const target = hashTarget(a);
    if (!target) return;
    e.preventDefault();
    const hash = a.getAttribute('href')!;
    if (location.hash !== hash) history.pushState(null, '', hash);
    const focusEl = focusTargetFor(target);
    scrollTo(target);
    focusEl.focus({ preventScroll: true });
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
