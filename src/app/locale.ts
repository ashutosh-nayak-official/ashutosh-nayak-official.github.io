import { LOCALES, localePath, type Locale } from '../i18n'

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
}

export function preferredLocale(stored: string | null, current: Locale): Locale | null {
  if (isLocale(stored) && stored !== current) return stored
  return null
}

/**
 * Where a page load should go for the stored locale: only the bare root (`/`) follows it,
 * keeping the hash (`/#contact` → `/de/#contact`). An explicit /de/ /nl/ /pl/ link is
 * never overridden. Null means stay.
 */
export function localeRedirect(stored: string | null, current: Locale, pathname: string, hash: string): string | null {
  if (pathname !== '/') return null
  const target = preferredLocale(stored, current)
  return target ? localePath(target) + hash : null
}
