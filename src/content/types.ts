import type { Dict } from '../i18n';

export type Locale = 'en' | 'de' | 'nl' | 'pl';

export type Key = keyof Dict;

export interface Stat {
  value: string;
  labelKey: Key;
  scopeKey: Key;
}

export interface Project {
  id: string;
  categoryKey: Key;
  titleKey: Key;
  problemKey: Key;
  approachKey: Key;
  outcomeKey: Key;
  stack: string[];
  featured: boolean;
  /** Public source, linked from the card (opens in a new tab). */
  repo?: { href: string; labelKey: Key };
}

export interface PathEntry {
  /** Canonical English dates, e.g. "Jun 2025 → present". Render `datesKey` for the localised form. */
  dates: string;
  datesKey: Key;
  titleKey: Key;
  orgKey: Key;
  bodyKey: Key;
}

export interface Credential {
  name: string;
  issuer: string;
  href: string;
  /** Path under the site root, file lives in public/badges. */
  badge: string;
  earlyAdopter?: true;
}

export interface SkillGroup {
  groupKey: Key;
  items: string[];
}

export interface VoiceStop {
  id: 'ring' | 'hear' | 'translate' | 'think' | 'speak';
  titleKey: Key;
  bodyKey: Key;
}

export interface AgentPhase {
  id: 'spec' | 'plan' | 'build' | 'verify' | 'ship';
  pillKey: Key;
  statusKey: Key;
  /** Human gate that closes this phase, if any. */
  gateKey?: Key;
}

export interface ChipRegion {
  id:
    | 'compute'
    | 'schedulers'
    | 'cache'
    | 'inference'
    | 'agents'
    | 'memory'
    | 'cicd'
    | 'observability'
    | 'network';
  labelKey: Key;
}
