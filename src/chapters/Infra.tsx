import { lazy, useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { useStageEnv, type StageEnv } from '../three/env';
import { StillImg, useStill } from '../three/Stills';
import { useVisibility } from '../app/useVisibility';
import { useSectionProgress } from '../scroll/useSectionProgress';
import { chipState, terminalTyping } from '../three/chip/layout';
import { Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';
import '../styles/infra.css';

const ChipScene = lazy(() => import('../three/scenes/ChipScene'));

/** "terraform apply ✓ compute online" → command, and the status from the tick on. */
function splitLine(text: string): [string, string] {
  const i = text.indexOf('✓');
  return i < 0 ? [text, ''] : [text.slice(0, i).trimEnd(), text.slice(i)];
}

/**
 * The chip's box. Live 3D: an empty labelled box the chip scene draws over. Static:
 * the same box holds the chip still. Never an empty labelled box: before capability
 * is known (SSR, no JS) it has no role (infra.css hides it), and a still that fails to
 * load hides the frame.
 */
function ChipFrame({ env, label }: { env: StageEnv | null; label: string }) {
  const still = useStill('infra', env?.mode ?? 'dark');
  if (!env) return <div className="chip-frame" data-chip-frame="" />;
  if (env.capability !== 'static') return <div className="chip-frame" data-chip-frame="" role="img" aria-label={label} />;
  if (still.failed) return <div className="chip-frame" data-chip-frame="" hidden />;
  return (
    <div className="chip-frame" data-chip-frame="" data-still="" role="img" aria-label={label}>
      <StillImg src={still.src} onError={still.onError} />
    </div>
  );
}

export default function Infra({ locale }: ChapterProps) {
  const tr = useT(locale);
  const env = useStageEnv();
  const [section, setSection] = useState<HTMLElement | null>(null);
  const term = useRef<HTMLOListElement>(null);
  const progress = useSectionProgress('infra');
  const live = !!env && env.capability !== 'static';
  const visible = useVisibility(live ? section : null, '10% 0px');

  // Type the terminal in step with the chip. Without JS (and in static mode) every line
  // is simply shown; the attributes below exist only while this loop runs.
  useEffect(() => {
    const ol = term.current;
    if (!live || !visible || !ol) return;
    const items = Array.from(ol.querySelectorAll<HTMLLIElement>('li'));
    const lengths = items.map((li) => Array.from(li.querySelector('.term-text')?.textContent ?? '').length);
    let last = -1;
    let raf = 0;
    const tick = () => {
      const n = chipState(progress.current).terminalLines;
      if (n !== last) {
        last = n;
        terminalTyping(n, lengths).forEach((f, i) => {
          const li = items[i];
          li.dataset.t = f >= 1 ? 'done' : f > 0 || i === Math.floor(n) ? 'typing' : 'wait';
          li.style.setProperty('--chars', String(Math.round(f * lengths[i])));
        });
        ol.dataset.typing = '';
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      delete ol.dataset.typing;
      for (const li of items) {
        delete li.dataset.t;
        li.style.removeProperty('--chars');
      }
    };
  }, [live, visible, progress]);

  return (
    <section id="infra" ref={setSection} className="chapter chapter--pinned infra">
      <div className="pin">
        <SceneSlot id="infra" scene={ChipScene} still={false} />
        <div className="wrap infra-grid">
          <div className="infra-copy">
            <Eyebrow text={tr('infra_eyebrow')} />
            <h2>{tr('infra_headline')}</h2>
            <p className="lead">{tr('infra_lead')}</p>
          </div>
          <ChipFrame env={env} label={tr('infra_chip_aria')} />
          <ol className="term" role="list" ref={term}>
            {site.infraTerminal.map((l) => {
              const [cmd, status] = splitLine(tr(l.textKey));
              return (
                <li key={l.textKey}>
                  <i aria-hidden="true">›</i>{' '}
                  <span className="term-text">
                    {cmd}
                    {status && (
                      <>
                        {' '}
                        <b>{status}</b>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
