import { describe, it, expect } from 'vitest';
import { LOCALES, localePath, t } from '../../src/i18n';
import { en } from '../../src/i18n/en';
import { de } from '../../src/i18n/de';
import { nl } from '../../src/i18n/nl';
import { pl } from '../../src/i18n/pl';
import { site } from '../../src/content/site';
import { INTERNAL_IDS, phoneLike } from './guards';

const dicts = { en, de, nl, pl } as Record<string, Record<string, string>>;

function collectKeys(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) node.forEach((n) => collectKeys(n, out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (/Key$/.test(k) && typeof v === 'string') out.add(v);
      else collectKeys(v, out);
    }
  }
}

describe('i18n', () => {
  it('has the same non-empty keys in all four locales', () => {
    expect(LOCALES).toEqual(['en', 'de', 'nl', 'pl']);
    const enKeys = Object.keys(en).sort();
    for (const l of LOCALES) {
      expect(Object.keys(dicts[l]).sort(), l).toEqual(enKeys);
      for (const [k, v] of Object.entries(dicts[l])) {
        expect(typeof v === 'string' && v.trim().length > 0, `${l}.${k}`).toBe(true);
      }
    }
  });

  it('every key used by site exists in the dictionaries', () => {
    const keys = new Set<string>();
    collectKeys(site, keys);
    expect(keys.size).toBeGreaterThan(50);
    for (const k of keys) {
      for (const l of LOCALES) expect(dicts[l][k], `${l}.${k}`).toBeTruthy();
    }
  });

  it('no locale string equals its key', () => {
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(dicts[l])) expect(v, `${l}.${k}`).not.toBe(k);
    }
  });

  it('maps locales to paths and looks strings up', () => {
    expect(LOCALES.map(localePath)).toEqual(['/', '/de/', '/nl/', '/pl/']);
    expect(t('en', 'contact_headline')).toBe("Let's build the next one.");
    expect(t('de', 'contact_headline')).not.toBe(t('en', 'contact_headline'));
  });

  it('keeps the required copy lines', () => {
    expect(en.agents_limits).toBe('Agents never approve, merge or deploy. I do.');
    expect(en.hero_promise_1).toBe('I build agents that build software.');
    expect(en.hero_promise_2).toBe('And the systems they run on.');
  });

  // Per-locale exact keys whose value may legitimately equal English: names, numbers,
  // technical tokens, terminal lines, chip labels, endonyms, SPEC/PLAN pills, job titles.
  const COMMON = [
    'hero_name', 'footer_copyright', 'chapter_00', 'chapter_01', 'chapter_02', 'chapter_03',
    'chapter_04', 'chapter_05', 'chapter_06', 'chapter_07',
    'lang_name_en', 'lang_name_de', 'lang_name_nl', 'lang_name_pl',
    'agents_pill_spec', 'agents_pill_plan', 'infra_chip_cache', 'infra_chip_cicd', 'infra_chip_observability',
    'proj_voice_category', 'proj_sdlc_category', 'proj_rag_category', 'proj_scraping_category',
    'proj_drainage_category', 'proj_scraping_title', 'proj_track_title',
    'path_dates_4', 'path_dates_5', 'path_title_1', 'path_title_2', 'path_title_3',
    'path_org_cozentus', 'path_org_college', 'credentials_early',
    'contact_linkedin_label', 'contact_github_label',
  ];
  const ALLOW_IDENTICAL: Record<'de' | 'nl' | 'pl', Set<string>> = {
    de: new Set([
      ...COMMON, 'infra_term_1', 'infra_term_5', 'infra_chip_compute', 'work_stack', 'work_problem', 'path_dates_2', 'skill_aws',
    ]),
    nl: new Set([
      ...COMMON, 'infra_term_1', 'infra_term_2', 'infra_term_5', 'infra_chip_compute', 'infra_chip_schedulers', 'infra_chip_agents', 'work_stack',
      'path_dates_2', 'skill_aws', 'skill_genai', 'nav_agents', 'nav_contact', 'contact_eyebrow',
      'footer_location', 'voice_monitor_row_3', 'agents_gate_1', 'agents_gate_2', 'agents_gate_3',
    ]),
    pl: new Set([...COMMON, 'infra_term_1', 'infra_term_2', 'infra_term_5', 'work_problem']),
  };

  it('de/nl/pl never leave English text behind', () => {
    for (const l of ['de', 'nl', 'pl'] as const) {
      for (const [k, v] of Object.entries(dicts[l])) {
        if (ALLOW_IDENTICAL[l].has(k)) continue;
        expect(v, `${l}.${k}`).not.toBe(en[k as keyof typeof en]);
      }
    }
  });

  it('voice languages line shows Hindi in Devanagari in every locale', () => {
    for (const l of LOCALES) expect(dicts[l].voice_languages, l).toMatch(/^हिन्दी · /);
  });

  it('never carries the phone number in any form', () => {
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(dicts[l])) {
        expect(phoneLike(v), `${l}.${k}`).toEqual([]);
        expect(v, `${l}.${k}`).not.toMatch(INTERNAL_IDS);
      }
    }
  });

  it('voice monitor labels contain no digits', () => {
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(dicts[l])) {
        if (/^voice_monitor_row_/.test(k)) expect(v, `${l}.${k}`).not.toMatch(/\d/);
      }
    }
  });

  it('has the path nav label and the seventh chapter number', () => {
    for (const l of LOCALES) {
      expect(dicts[l].nav_path, `${l}.nav_path`).toBeTruthy();
      expect(dicts[l].chapter_07, `${l}.chapter_07`).toBe('07');
      for (const k of ['path_eyebrow', 'credentials_eyebrow', 'skills_eyebrow']) expect(dicts[l][k]).toMatch(/^06 · /);
      expect(dicts[l].work_eyebrow).toMatch(/^05 · /);
      expect(dicts[l].contact_eyebrow).toMatch(/^07 · /);
    }
  });

  it('has accessibility keys, endonym language names and a {pct} loader placeholder', () => {
    for (const l of LOCALES) {
      for (const k of ['nav_menu_open', 'nav_menu_close', 'hero_visual_label']) expect(dicts[l][k], `${l}.${k}`).toBeTruthy();
      expect(dicts[l].lang_name_en).toBe('English');
      expect(dicts[l].lang_name_de).toBe('Deutsch');
      expect(dicts[l].lang_name_nl).toBe('Nederlands');
      expect(dicts[l].lang_name_pl).toBe('Polski');
      expect(dicts[l].loader_progress_aria).toContain('{pct}');
    }
  });

  it('keeps pill labels within 12 characters', () => {
    for (const l of LOCALES) {
      for (const k of ['spec', 'plan', 'build', 'verify', 'ship']) {
        expect(dicts[l][`agents_pill_${k}`].length, `${l}.${k}`).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe('owner copy: location is the country only', () => {
  const COUNTRY = { en: 'India', de: 'Indien', nl: 'India', pl: 'Indie' } as const;

  it('footer_location is the country in every locale', () => {
    for (const l of LOCALES) expect(dicts[l].footer_location, l).toBe(COUNTRY[l]);
  });

  it('hero_context_2 names the country, not a city', () => {
    for (const l of LOCALES) expect(dicts[l].hero_context_2, l).toContain(` · ${COUNTRY[l]} · `);
    expect(en.hero_context_2).toBe('GenAI and Cloud/DevOps · India · 5+ years.');
  });

  it('organisations carry no city', () => {
    for (const l of LOCALES) {
      expect(dicts[l].path_org_cozentus, l).toBe('Cozentus Technologies');
      expect(dicts[l].path_org_college, l).toBe('Silicon Institute of Technology');
    }
  });

  it('no string names the city, and the "built with" footer line is gone', () => {
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(dicts[l])) expect(v, `${l}.${k}`).not.toMatch(/bhubaneswar/i);
      expect(dicts[l], l).not.toHaveProperty('footer_built');
    }
  });

  it('has a non-empty label for the framework repo link in every locale', () => {
    for (const l of LOCALES) expect(dicts[l].proj_sdlc_repo_label, l).toBeTruthy();
  });
});
