// Renders the static-fallback stills and the Open Graph image from the real scenes.
//
//   npm run build && node scripts/capture-stills.mjs
//
// Serves dist/ with `vite preview`, opens each `?still=<id>&mode=<m>` page in headless
// Chromium (WebGL through SwiftShader), waits for window.__stillReady (src/app/stillMode.ts)
// and writes:
//   public/stills/{top,call,agents,infra,contact}-{dark,light}.webp   (quality 0.8)
//   public/og/engine.jpg                                               (1200×630)
// Run `npm run build` again afterwards so dist/ ships them.
// Optional: `node scripts/capture-stills.mjs contact og` shoots only those ids.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.STILLS_PORT ?? 4179);
const ORIGIN = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 1000 };
const WEBP_QUALITY = 0.8;

/**
 * What to shoot per chapter: the element whose box the still fills in the static
 * fallback, and the device scale (output px per CSS px; at most 2 per the size budget).
 * Full-screen slots (call) stay at 1×; smaller boxes get a little more resolution.
 * `pad` widens the shot on each side by that fraction of the box (the chip's pins and
 * glow reach past its frame; infra.css lets the still overflow the frame by the same).
 */
const SHOTS = {
  top: { selector: '[data-scene="top"]', scale: 1.25 },
  call: { selector: '[data-scene="call"]', scale: 1 },
  // 1440×900: on a taller screen the agents slot drops below aspect 0.75 and the scene
  // switches to its phone layout (dim, lower half only).
  agents: { selector: '[data-scene="agents"]', scale: 1, viewport: { width: 1440, height: 900 } },
  infra: { selector: '[data-chip-frame]', scale: 1.5, pad: 0.06 },
  contact: { selector: '[data-scene="contact"]', scale: 1 },
};
const MODES = ['dark', 'light'];
const ONLY = process.argv.slice(2);
const wanted = (id) => ONLY.length === 0 || ONLY.includes(id);

async function waitForServer(url, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`preview server did not start at ${url}`);
}

async function newPage(browser, { viewport, scale, mode }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: mode });
  // skip the assembly loader (a repeat visit in the same session)
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('ge-intro-seen', '1');
    } catch {
      /* ignore */
    }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return { ctx, page, errors };
}

async function openStill(page, query) {
  await page.goto(`${ORIGIN}/?${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__stillReady === true, null, { timeout: 60000 });
}

/** Element box ∩ viewport, in CSS px. */
async function clipOf(page, selector, pad = 0) {
  return page.evaluate(
    ({ sel, pad }) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`no ${sel}`);
      const r = el.getBoundingClientRect();
      const px = r.width * pad;
      const py = r.height * pad;
      const x = Math.max(0, r.left - px);
      const y = Math.max(0, r.top - py);
      const w = Math.min(window.innerWidth, r.right + px) - x;
      const h = Math.min(window.innerHeight, r.bottom + py) - y;
      return { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) };
    },
    { sel: selector, pad },
  );
}

/**
 * Crop a full-viewport PNG to `clip` (CSS px; the PNG is at `scale`) and encode WebP
 * with the browser's own encoder (no native image tooling needed).
 */
async function toWebp(page, png, clip, scale) {
  const b64 = await page.evaluate(
    async ({ data, q, clip, scale }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = Math.round(clip.width * scale);
      c.height = Math.round(clip.height * scale);
      c.getContext('2d').drawImage(
        img,
        Math.round(clip.x * scale),
        Math.round(clip.y * scale),
        c.width,
        c.height,
        0,
        0,
        c.width,
        c.height,
      );
      const url = c.toDataURL('image/webp', q);
      if (!url.startsWith('data:image/webp')) throw new Error('webp encoding unsupported');
      return url.slice(url.indexOf(',') + 1);
    },
    { data: png.toString('base64'), q: WEBP_QUALITY, clip, scale },
  );
  return Buffer.from(b64, 'base64');
}

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  const written = [];
  let browser;
  try {
    await waitForServer(ORIGIN);
    browser = await chromium.launch({
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    });
    await mkdir(join(ROOT, 'public/stills'), { recursive: true });
    await mkdir(join(ROOT, 'public/og'), { recursive: true });

    for (const [id, shot] of Object.entries(SHOTS)) {
      if (!wanted(id)) continue;
      for (const mode of MODES) {
        const { ctx, page, errors } = await newPage(browser, { viewport: shot.viewport ?? VIEWPORT, scale: shot.scale, mode });
        await openStill(page, `still=${id}&mode=${mode}`);
        const clip = await clipOf(page, shot.selector, shot.pad);
        const png = await page.screenshot({ type: 'png' });
        const webp = await toWebp(page, png, clip, shot.scale);
        const out = join(ROOT, 'public/stills', `${id}-${mode}.webp`);
        await writeFile(out, webp);
        written.push([out, webp.length, `${Math.round(clip.width * shot.scale)}×${Math.round(clip.height * shot.scale)}`]);
        if (errors.length) console.warn(`  console errors (${id}-${mode}):`, errors);
        await ctx.close();
      }
    }

    // Open Graph: the hero with name and promise, dark, 1200×630.
    if (wanted('og')) {
      const { ctx, page, errors } = await newPage(browser, {
        viewport: { width: 1200, height: 630 },
        scale: 1,
        mode: 'dark',
      });
      await openStill(page, 'still=og');
      const jpg = await page.screenshot({ type: 'jpeg', quality: 85 });
      const out = join(ROOT, 'public/og/engine.jpg');
      await writeFile(out, jpg);
      written.push([out, jpg.length, '1200×630']);
      if (errors.length) console.warn('  console errors (og):', errors);
      await ctx.close();
    }
  } finally {
    await browser?.close();
    server.kill();
  }

  let total = 0;
  for (const [file, bytes, size] of written) {
    total += bytes;
    console.log(`${file.slice(ROOT.length + 1)}  ${size}  ${(bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`${written.length} images, ${(total / 1024).toFixed(1)} KB total`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
