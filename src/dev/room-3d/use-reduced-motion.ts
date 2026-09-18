import { useSyncExternalStore } from 'react'

/**
 * Whether the visitor has asked the OS for less motion — live, so flipping the
 * setting while the page is open takes effect without a reload.
 *
 * `?motion=reduce` forces it on. That override exists because reduced motion
 * is the one path of this demo nobody sees by accident: it needs an OS
 * setting changed to look at, so without a switch in the address bar it gets
 * reviewed once and then silently rots. It lives only in this dev-only module.
 */
const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getSnapshot() {
  if (new URLSearchParams(window.location.search).get('motion') === 'reduce') return true
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
