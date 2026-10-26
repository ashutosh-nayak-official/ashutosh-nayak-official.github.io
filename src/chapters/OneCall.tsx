import { lazy, useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { callState } from '../engine/call';
import { sectionProgressRef } from '../scroll/useSectionProgress';
import { Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';
import '../styles/call.css';

const CallScene = lazy(() => import('../three/scenes/CallScene'));

/**
 * 02 · One call, step by step. Pinned for 3 screens: the engine unwinds into a Spectrum
 * sound wave (CallScene), whose five stop nodes light in turn; the matching DOM cards
 * get `data-lit`, and the newest lit card `aria-current="step"`. Every card is fully
 * readable without JS or progress (static capability, reduced motion).
 */
export default function OneCall({ locale }: ChapterProps) {
  const tr = useT(locale);
  const [lit, setLit] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Lit stops follow the scroll progress ref; state changes only when the count changes.
  useEffect(() => {
    const progress = sectionProgressRef('call');
    let raf = 0;
    const read = () => {
      raf = 0;
      setLit(callState(progress.current).activeStops);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // When the copy is taller than the pinned frame (short or narrow screens), it glides up
  // by the overflow while pinned (--call-shift, used with --p in call.css).
  useEffect(() => {
    const sec = sectionRef.current;
    const pin = pinRef.current;
    const wrap = wrapRef.current;
    if (!sec || !pin || !wrap || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const cs = getComputedStyle(pin);
      const need = wrap.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const shift = Math.max(0, Math.ceil(need - pin.clientHeight));
      sec.style.setProperty('--call-shift', `${shift}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(pin);
    ro.observe(wrap);
    measure();
    return () => ro.disconnect();
  }, []);

  return (
    <section id="call" ref={sectionRef} className="chapter chapter--pinned call">
      <div className="pin" ref={pinRef}>
        <SceneSlot id="call" scene={CallScene} />
        <div className="wrap" ref={wrapRef}>
          <Eyebrow text={tr('voice_eyebrow')} />
          <h2>{tr('voice_headline')}</h2>
          <p className="lead">{tr('voice_lead')}</p>
          <p className="langs">{tr('voice_languages')}</p>
          {/* the band the sound wave is drawn in (CallScene measures it) */}
          <div className="call-wave" aria-hidden="true" />
          <ol className="stops" role="list">
            {site.voiceStops.map((s, i) => (
              <li
                className="stop"
                key={s.id}
                data-stop={s.id}
                data-lit={i < lit ? '' : undefined}
                aria-current={i === lit - 1 ? 'step' : undefined}
              >
                <span className="n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{tr(s.titleKey)}</h3>
                <p>{tr(s.bodyKey)}</p>
              </li>
            ))}
          </ol>
          <div className="monitor">
            <p className="monitor-title">{tr(site.voiceMonitor.titleKey)}</p>
            <ul role="list">
              {site.voiceMonitor.rows.map((r) => (
                <li key={r.labelKey}>
                  <span className="dot" aria-hidden="true" />
                  {tr(r.labelKey)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
