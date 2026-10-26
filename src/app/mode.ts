import { getLocalStorage, safeSet } from './storage'

export type Mode = 'dark' | 'light'

export function initialMode(stored: string | null, prefersDark: boolean): Mode {
  if (stored === 'dark' || stored === 'light') return stored
  return prefersDark ? 'dark' : 'light'
}

export function applyMode(m: Mode): void {
  document.documentElement.dataset.mode = m
  safeSet(getLocalStorage(), 'ge-mode', m)
}
