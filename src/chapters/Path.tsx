import { site } from '../content/site';
import { EXTERNAL, Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';

export default function Path({ locale }: ChapterProps) {
  const tr = useT(locale);
  return (
    <section id="path" className="chapter path">
      <SceneSlot id="path" />
      <div className="wrap">
        <Eyebrow text={tr('path_eyebrow')} />
        <h2>{tr('path_headline')}</h2>
        <div className="two">
          <ol className="tl" role="list">
            {site.path.map((e) => (
              <li key={e.datesKey}>
                <small>{tr(e.datesKey)}</small>
                <h3>{tr(e.titleKey)}</h3>
                <p className="org">{tr(e.orgKey)}</p>
                <p>{tr(e.bodyKey)}</p>
              </li>
            ))}
          </ol>
          <div className="side">
            <div className="block">
              <Eyebrow text={tr('credentials_eyebrow')} />
              <h3>{tr('credentials_headline')}</h3>
              <ul className="creds" role="list">
                {site.credentials.map((c) => (
                  <li key={c.href}>
                    <a className="cred" href={c.href} {...EXTERNAL}>
                      <img src={c.badge} alt="" width={44} height={44} loading="lazy" decoding="async" />
                      <span className="cred-text">
                        <b>{c.name}</b>
                        <small>
                          {c.issuer}
                          {c.earlyAdopter && <> · {tr('credentials_early')}</>}
                        </small>
                      </span>
                      <span className="verify">{tr('credentials_verify')}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="block">
              <Eyebrow text={tr('skills_eyebrow')} />
              <h3>{tr('skills_headline')}</h3>
              <dl className="skills">
                {site.skills.map((g) => (
                  <div key={g.groupKey}>
                    <dt>{tr(g.groupKey)}</dt>
                    <dd>{g.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
