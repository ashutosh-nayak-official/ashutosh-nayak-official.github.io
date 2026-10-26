export function safeGet(store: Storage | undefined, key: string): string | null {
  try {
    return store ? store.getItem(key) : null
  } catch {
    return null
  }
}

export function safeSet(store: Storage | undefined, key: string, value: string): void {
  try {
    store?.setItem(key, value)
  } catch {
    /* storage unavailable: ignore */
  }
}

export function getLocalStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
