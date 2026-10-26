import { site } from '../content/site';
import { Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';
import '../styles/work.css';

export default function Work({ locale }: ChapterProps) {
  const tr = useT(locale);
  return (
    <section id="work" className="chapter work">
      <SceneSlot id="work" />
      <div className="wrap">
        <Eyebrow text={tr('work_eyebrow')} />
        <h2>{tr('work_headline')}</h2>
        <ul className="grid" role="list">
          {site.projects.map((p) => (
            <li key={p.id} className={p.featured ? 'card feat' : 'card'} data-project={p.id}>
              {p.featured && <span className="feat-glow" aria-hidden="true" />}
              <p className="card-top">
                <span className="lbl">{tr(p.categoryKey)}</span>
                {p.featured && <span className="feat-tag">{tr('work_featured')}</span>}
              </p>
              <h3>{tr(p.titleKey)}</h3>
              <dl>
                <dt>{tr('work_problem')}</dt>
                <dd>{tr(p.problemKey)}</dd>
                <dt>{tr('work_approach')}</dt>
                <dd>{tr(p.approachKey)}</dd>
                <dt>{tr('work_stack')}</dt>
                <dd className="tags">{p.stack.join(' · ')}</dd>
                <dt>{tr('work_outcome')}</dt>
                <dd className="outcome">{tr(p.outcomeKey)}</dd>
              </dl>
              {p.repo && (
                <a className="card-link" href={p.repo.href} target="_blank" rel="noopener noreferrer">
                  {tr(p.repo.labelKey)} <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
