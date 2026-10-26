// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { safeGet, safeSet } from '../../src/app/storage'
import { initialMode, applyMode } from '../../src/app/mode'
import { isLocale, localeRedirect, preferredLocale } from '../../src/app/locale'
import { detectCapability } from '../../src/app/capability'
import { useVisibility } from '../../src/app/useVisibility'
import { NO_FLASH_SCRIPT } from '../../src/app/noFlash'

// Node 26 exposes a broken global localStorage that shadows jsdom's; install a Map-backed one.
const mem = new Map<string, string>()
const memStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
} as unknown as Storage
Object.defineProperty(window, 'localStorage', { configurable: true, value: memStorage })
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memStorage })

const throwing = {
  getItem() { throw new Error('x') },
  setItem() { throw new Error('x') },
} as unknown as Storage

describe('storage', () => {
  it('stores-survive-throwing-storage', () => {
    expect(safeGet(throwing, 'k')).toBeNull()
    expect(() => safeSet(throwing, 'k', 'v')).not.toThrow()
    expect(safeGet(undefined, 'k')).toBeNull()
    expect(() => safeSet(undefined, 'k', 'v')).not.toThrow()
    expect(initialMode(null, false)).toBe('light')
  })
})

describe('initialMode', () => {
  it.each([
    ['dark', false, 'dark'],
    ['light', true, 'light'],
    [null, true, 'dark'],
    [null, false, 'light'],
    ['junk', true, 'dark'],
  ] as const)('%s/%s -> %s', (s, p, e) => expect(initialMode(s, p)).toBe(e))
  it('applyMode sets dataset and persists', () => {
    applyMode('dark')
    expect(document.documentElement.dataset.mode).toBe('dark')
    expect(localStorage.getItem('ge-mode')).toBe('dark')
  })
})

describe('preferredLocale', () => {
  it.each([
    ['de', 'en', 'de'],
    ['en', 'en', null],
    [null, 'en', null],
    ['fr', 'en', null],
    ['pl', 'nl', 'pl'],
  ] as const)('%s vs %s -> %s', (s, c, e) => expect(preferredLocale(s, c)).toBe(e))
})

describe('localeRedirect (stored locale on page load)', () => {
  it.each([
    // the bare root follows the stored locale, keeping the hash
    ['de', 'en', '/', '', '/de/'],
    ['de', 'en', '/', '#contact', '/de/#contact'],
    ['pl', 'en', '/', '#work', '/pl/#work'],
    // an explicit locale link is never overridden
    ['de', 'pl', '/pl/', '', null],
    ['en', 'de', '/de/', '#contact', null],
    ['nl', 'de', '/de/', '', null],
    // nothing stored, same locale, or junk: stay
    [null, 'en', '/', '#contact', null],
    ['en', 'en', '/', '', null],
    ['fr', 'en', '/', '', null],
  ] as const)('stored %s on %s %s%s -> %s', (s, c, path, hash, e) =>
    expect(localeRedirect(s, c, path, hash)).toBe(e),
  )
})

describe('isLocale', () => {
  it.each([
    ['en', true],
    ['de', true],
    ['nl', true],
    ['pl', true],
    ['fr', false],
    ['', false],
    [null, false],
    [undefined, false],
  ] as const)('%s -> %s', (v, e) => expect(isLocale(v)).toBe(e))
})

describe('detectCapability', () => {
  const base = { reducedMotion: false, webgl: true, cores: 8, memoryGB: 8, width: 1440 }
  it.each([
    [{}, 'full'],
    [{ reducedMotion: true }, 'static'],
    [{ webgl: false }, 'static'],
    [{ reducedMotion: true, cores: 2 }, 'static'],
    [{ cores: 4 }, 'lite'],
    [{ memoryGB: 4 }, 'lite'],
    [{ width: 767 }, 'lite'],
    [{ width: 768 }, 'full'],
    [{ cores: 5 }, 'full'],
    [{ memoryGB: undefined }, 'full'],
  ] as const)('%j -> %s', (o, e) => expect(detectCapability({ ...base, ...o })).toBe(e))
})

describe('useVisibility', () => {
  let cb: IntersectionObserverCallback
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(c: IntersectionObserverCallback) { cb = c }
      observe() {}
      disconnect() {}
      unobserve() {}
    })
  })
  it('visibility-pauses-frameloop', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useVisibility(ref))
    expect(result.current).toBe(false)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    expect(result.current).toBe(false)
    act(() => { cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver) })
    expect(result.current).toBe(true)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    expect(result.current).toBe(false)
  })
})

describe('NO_FLASH_SCRIPT', () => {
  it('sets mode from storage or media and never throws', () => {
    localStorage.setItem('ge-mode', 'light')
    window.matchMedia = (() => ({ matches: true })) as never
    new Function(NO_FLASH_SCRIPT)()
    expect(document.documentElement.dataset.mode).toBe('light')
    localStorage.removeItem('ge-mode')
    new Function(NO_FLASH_SCRIPT)()
    expect(document.documentElement.dataset.mode).toBe('dark')
    const spy = vi.spyOn(memStorage, 'getItem').mockImplementation(() => { throw new Error('x') })
    expect(() => new Function(NO_FLASH_SCRIPT)()).not.toThrow()
    spy.mockRestore()
  })
})
