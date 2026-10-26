import { Fragment, lazy, useEffect, useState } from 'react';
import { site } from '../content/site';
import { useVisibility } from '../app/useVisibility';
import { useStageEnv } from '../three/env';
import { sectionProgressRef } from '../scroll/useSectionProgress';
import { PHASES, agentsState } from '../three/agents/state';
import { Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';
import '../styles/agents.css';

const AgentsScene = lazy(() => import('../three/scenes/AgentsScene'));

/**
 * While the chapter is pinned and on screen, mirror the scroll-driven phase onto the DOM
 * (no React state per frame): `data-phase` on the section, `.on`/`.done` on the pills,
 * `.open` on approved gates. Without JS or in the static fallback none of this is set and
 * every row stays fully visible.
 */
function usePhaseSync(section: HTMLElement | null, live: boolean) {
  const visible = useVisibility(live ? section : null);
  useEffect(() => {
    if (!section || !live) return;
    section.dataset.live = '';
    return () => {
      delete section.dataset.live;
      delete section.dataset.phase;
      section
        .querySelectorAll('.on, .done, .open, .settled')
        .forEach((el) => el.classList.remove('on', 'done', 'open', 'settled'));
    };
  }, [section, live]);

  useEffect(() => {
    if (!section || !live || !visible) return;
    const progress = sectionProgressRef('agents');
    const steps = Array.from(section.querySelectorAll<HTMLElement>('.steps .step'));
    const gates = Array.from(section.querySelectorAll<HTMLElement>('.steps .gate'));
    const rows = Array.from(section.querySelectorAll<HTMLElement>('.phases li[data-phase]'));
    let last = '';
    let first = true;
    let raf = 0;
    const tick = () => {
      const s = agentsState(progress.current);
      const key = s.phase + s.gates.join();
      if (key !== last) {
        last = key;
        const i = PHASES.indexOf(s.phase);
        section.dataset.phase = s.phase;
        steps.forEach((el, k) => {
          el.classList.toggle('on', k === i);
          el.classList.toggle('done', k < i);
        });
        rows.forEach((el, k) => el.classList.toggle('on', k === i));
        gates.forEach((el, k) => {
          // Gates already open when the sync starts (e.g. reload mid-chapter) don't replay the pulse.
          if (first && s.gates[k]) el.classList.add('settled');
          if (!s.gates[k]) el.classList.remove('settled');
          el.classList.toggle('open', s.gates[k]);
        });
        first = false;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [section, live, visible]);
}

export default function Agents({ locale }: ChapterProps) {
  const tr = useT(locale);
  const env = useStageEnv();
  const [section, setSection] = useState<HTMLElement | null>(null);
  usePhaseSync(section, !!env && env.capability !== 'static');

  return (
    <section id="agents" ref={setSection} className="chapter chapter--pinned agents">
      <div className="pin">
        <SceneSlot id="agents" scene={AgentsScene} />
        <div className="wrap">
          <Eyebrow text={tr('agents_eyebrow')} />
          <h2>{tr('agents_headline')}</h2>
          <p className="lead">{tr('agents_lead')}</p>
          {/* Visual progress indicator; the phases list below carries the same content for assistive tech. */}
          <ol className="steps" role="list" aria-hidden="true">
            {site.agentPhases.map((p) => (
              <Fragment key={p.id}>
                <li className="step" data-phase={p.id}>
                  {tr(p.pillKey)}
                </li>
                {p.gateKey && (
                  <li className="gate" data-gate={p.id}>
                    <span className="gate-name">{tr(p.gateKey)}</span>
                    <span className="gate-ok">✓ {tr('agents_approved')}</span>
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
          <ol className="phases" role="list">
            {site.agentPhases.map((p) => (
              <Fragment key={p.id}>
                <li data-phase={p.id}>
                  <b>{tr(p.pillKey)}</b>
                  <span>{tr(p.statusKey)}</span>
                </li>
                {p.gateKey && <li className="sr-only">{tr(p.gateKey)}</li>}
              </Fragment>
            ))}
          </ol>
          <p className="limits">{tr('agents_limits')}</p>
        </div>
      </div>
    </section>
  );
}
