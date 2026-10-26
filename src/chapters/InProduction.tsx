import { site } from '../content/site';
import { Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';

export default function InProduction({ locale }: ChapterProps) {
  const tr = useT(locale);
  return (
    <section id="production" className="chapter production">
      <SceneSlot id="production" />
      <div className="wrap">
        <Eyebrow text={tr('stats_eyebrow')} />
        <h2>{tr('stats_headline')}</h2>
        <ul className="stats" role="list">
          {site.stats.map((s) => (
            <li className="stat" key={s.labelKey}>
              <b>{s.value}</b>
              <span>{tr(s.labelKey)}</span>
              <i>{tr(s.scopeKey)}</i>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
