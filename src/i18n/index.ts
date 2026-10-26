import type { Locale } from '../content/types';
import { en } from './en';
import { de } from './de';
import { nl } from './nl';
import { pl } from './pl';

export type { Locale } from '../content/types';

export type Dict = typeof en;

export const LOCALES: Locale[] = ['en', 'de', 'nl', 'pl'];

const dictionaries: Record<Locale, Dict> = { en, de, nl, pl };

/** Path of a locale's pre-rendered page: `/`, `/de/`, `/nl/`, `/pl/`. */
export function localePath(l: Locale): string {
  return l === 'en' ? '/' : `/${l}/`;
}

export function t(locale: Locale, key: keyof Dict): string {
  return dictionaries[locale][key];
}
