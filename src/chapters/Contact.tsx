import { lazy } from 'react';
import { site } from '../content/site';
import { EXTERNAL, Eyebrow, SceneSlot, useT, type ChapterProps } from './shared';

const ContactScene = lazy(() => import('../three/scenes/ContactScene'));

export default function Contact({ locale }: ChapterProps) {
  const tr = useT(locale);
  const { email, linkedin, github } = site.contact;
  return (
    <section id="contact" className="chapter contact">
      <SceneSlot id="contact" scene={ContactScene} />
      <div className="wrap">
        <Eyebrow text={tr('contact_eyebrow')} />
        <h2>{tr('contact_headline')}</h2>
        <p className="lead">{tr('contact_lead')}</p>
        <ul className="row" role="list">
          <li>
            <a className="primary" href={`mailto:${email}`}>
              <span className="sr-only">{tr('contact_email_label')}: </span>
              {email}
            </a>
          </li>
          <li>
            <a href={linkedin} {...EXTERNAL}>
              {tr('contact_linkedin_label')} <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href={github} {...EXTERNAL}>
              {tr('contact_github_label')} <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
