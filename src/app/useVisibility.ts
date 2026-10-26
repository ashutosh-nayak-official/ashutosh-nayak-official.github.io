import { useEffect, useState, type RefObject } from 'react'

type Target = RefObject<Element | null> | Element | null

const isRef = (t: Target): t is RefObject<Element | null> =>
  t !== null && typeof t === 'object' && 'current' in t && !(typeof Element !== 'undefined' && t instanceof Element)

/**
 * True only while the document is visible and the element intersects the viewport.
 * Pass the element itself (e.g. from a callback ref held in state) so the observer
 * attaches whenever the element appears; a ref object is read on each render.
 * Without IntersectionObserver it fails open: intersecting is assumed.
 */
export function useVisibility(target: Target, rootMargin = '0px'): boolean {
  const [docVisible, setDocVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const noIO = typeof IntersectionObserver === 'undefined'
  const [intersecting, setIntersecting] = useState(noIO)
  const el = isRef(target) ? target.current : target

  useEffect(() => {
    const onChange = () => setDocVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    onChange()
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIntersecting(true)
      return
    }
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1]
        if (last) setIntersecting(last.isIntersecting)
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el, rootMargin])

  return docVisible && intersecting
}
