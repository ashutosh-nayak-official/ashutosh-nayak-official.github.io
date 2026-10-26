import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { site } from '../../src/content/site';
import { en } from '../../src/i18n/en';
import { de } from '../../src/i18n/de';
import { nl } from '../../src/i18n/nl';
import { pl } from '../../src/i18n/pl';
import { INTERNAL_IDS, phoneLike } from './guards';

const root = resolve(__dirname, '../..');
const siteJson = JSON.stringify(site);
const allText = [siteJson, ...[en, de, nl, pl].map((d) => JSON.stringify(d))].join('\n');

describe('site content', () => {
  it('keeps every required fact', () => {
    const haystack = siteJson + JSON.stringify(en);
    const facts = [
      '15,000+', '80%', '99%+', '5+', '15+', '20+', '95%',
      'Jun 2025', 'Jun 2023', 'Jun 2021', 'Mar 2023', '2017', '2021', '2018',
      'Silicon Institute of Technology', 'Cozentus Technologies',
      'LiveKit', 'SIP', 'Asterisk', 'Terraform', 'AWS Bedrock', 'MCP',
    ];
    for (const f of facts) expect(haystack, f).toContain(f);
  });

  it('has 8 projects with exactly 2 featured: voice bot and agentic SDLC framework', () => {
    expect(site.projects).toHaveLength(8);
    const featured = site.projects.filter((p) => p.featured).map((p) => p.id);
    expect(featured.sort()).toEqual(['sdlc', 'voice']);
    expect(site.projects.some((p) => /mail/i.test(p.id))).toBe(false);
  });

  it('lists the path newest first with Senior Technical Manager, DevOps & Innovation Lead (Jun 2025 → present)', () => {
    expect(site.path).toHaveLength(5);
    expect(site.path[0].dates).toBe('Jun 2025 → present');
    expect(en[site.path[0].titleKey]).toBe('Senior Technical Manager, DevOps & Innovation Lead');
    expect(site.path[1].dates).toBe('Jun 2023 → Jun 2025');
    expect(en[site.path[1].titleKey]).toBe('Technical Manager, DevOps & Innovation Lead');
    expect(site.path[2].dates).toBe('Jun 2021 → Mar 2023');
  });

  it('has 4 Credly credentials whose badge files exist in public/badges', () => {
    expect(site.credentials).toHaveLength(4);
    for (const c of site.credentials) {
      expect(c.href).toMatch(/^https:\/\/www\.credly\.com\/badges\//);
      expect(existsSync(resolve(root, 'public', c.badge.replace(/^\//, '')))).toBe(true);
    }
    expect(site.credentials.filter((c) => c.earlyAdopter)).toHaveLength(1);
  });

  it('never contains a phone number or tel: link', () => {
    expect(phoneLike(allText)).toEqual([]);
    expect(allText).not.toMatch(/tel:/);
  });

  it('the guards themselves catch what they are for', () => {
    // synthetic number, not a real one
    expect(phoneLike('call +00 123 456 7890 now')).toHaveLength(1);
    expect(phoneLike('15,000+ calls · 5+ years · 2017 → 2021 · 99%+')).toEqual([]);
    // three letters built from char codes, encoded so the repo doesn't contain the literal
    expect(String.fromCharCode(77, 68, 83)).toMatch(INTERNAL_IDS);
    expect('a mail-service platform').not.toMatch(INTERNAL_IDS);
  });

  it('never names internal mail-service identifiers', () => {
    expect(allText).not.toMatch(INTERNAL_IDS);
  });

  it('uses only the three contact destinations', () => {
    expect(site.contact).toEqual({
      email: 'ashutosh.nayak.formal@gmail.com',
      linkedin: 'https://www.linkedin.com/in/ashutosh-nayak-81an',
      github: 'https://github.com/ashutosh-nayak-official',
    });
    const urls = siteJson.match(/https?:\/\/[^"]+/g) ?? [];
    const allowed = (u: string) =>
      u === site.contact.linkedin ||
      u === site.contact.github ||
      u === 'https://github.com/ashutosh-nayak-official/agentic-sdlc-framework' ||
      u.startsWith('https://www.credly.com/badges/');
    expect(urls.filter((u) => !allowed(u))).toEqual([]);
    expect(siteJson.match(/[\w.-]+@[\w.-]+/g)).toEqual([site.contact.email]);
  });
});
