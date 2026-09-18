import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'

/**
 * Mulberry32 — small, fast, deterministic. Everything "random" in the room
 * (book widths, leaf angles, the rug's knots) is drawn from a fixed seed, so
 * the room is styled the same way on every load and every replay.
 */
export function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A turned profile — [radius, height] pairs from the bottom up — as a LatheGeometry, memoised. */
export function useLathe(profile: readonly (readonly [number, number])[], segments = 64) {
  return useMemo(
    () => new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), segments),
    // The profiles are module-level constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
