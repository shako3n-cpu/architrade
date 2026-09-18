import { useContext, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Group, type MeshStandardMaterial } from 'three'
import { useLampWarmth } from './furnish-clock'
import { LampLightContext } from './lamp-light-pool'
import { M } from './materials'

/**
 * ============================================================================
 * A LAMP COMING ON
 * ----------------------------------------------------------------------------
 * Every lamp in every room lights the same way: dark while it falls, then its
 * bulb, the inside of its shade, sometimes the shade's own skin, and a warm
 * point light come up together once it has landed — and go out as it leaves.
 * How far on is read from the DropIn the lamp is in (see lampWarmth).
 *
 * Each lamp gets its OWN glowing materials, cloned from the shared ones in
 * materials.ts: every lamp warms up on its own clock, and shared, the
 * kitchen's two pendants and a lamp leaving the previous room would all be
 * writing to one glow.
 *
 * The point light is BORROWED from the scene's fixed pool rather than owned —
 * see lamp-light-pool.ts for why. The lamp marks where its light belongs with
 * the `anchor` group; the pooled light is moved there every frame.
 * ============================================================================
 */

export type GlowLevels = {
  /** Bulb emissive intensity at full warmth. Above 1, so bloom catches it. */
  bulb: number
  /** Inside of the shade. */
  shade?: number
  /**
   * The shade's OUTSIDE, for shades that let light through — linen, opal
   * glass. `make` builds the material once; its emissive is driven to `peak`.
   */
  skin?: { make: () => MeshStandardMaterial; peak: number }
  /** The point light's intensity at full warmth, and how far it reaches. */
  light: number
  distance: number
}

export function useLampGlow(levels: GlowLevels) {
  const warmth = useLampWarmth()
  const pool = useContext(LampLightContext)
  const anchor = useRef<Group>(null)
  const slot = useRef<number | null>(null)

  const glow = useMemo(
    () => ({
      bulb: M.bulb.clone(),
      shadeInner: M.shadeInner.clone(),
      skin: levels.skin?.make() ?? null,
    }),
    // Built once per lamp; the levels are constants at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const at = useMemo(() => new Vector3(), [])

  useEffect(
    () => () => {
      glow.bulb.dispose()
      glow.shadeInner.dispose()
      glow.skin?.dispose()
    },
    [glow],
  )

  // A light from the pool for as long as the lamp is mounted.
  useEffect(() => {
    if (!pool) return
    const claimed = pool.claim()
    slot.current = claimed
    return () => {
      if (claimed !== null) pool.release(claimed)
      slot.current = null
    }
  }, [pool])

  useFrame(() => {
    const on = warmth()
    glow.bulb.emissiveIntensity = levels.bulb * on
    glow.shadeInner.emissiveIntensity = (levels.shade ?? 0) * on
    if (glow.skin && levels.skin) glow.skin.emissiveIntensity = levels.skin.peak * on

    const light = pool && slot.current !== null ? pool.light(slot.current) : null
    if (light && anchor.current) {
      // The pooled light lives outside the room, so the room being hidden —
      // while its shaders compile, see <Arrival> — does not hide the light.
      // Under reduced motion the lamp is "on" from the first frame, and it lit
      // the wall of an empty room before the lamp itself appeared.
      let shown = true
      anchor.current.traverseAncestors((ancestor) => {
        if (!ancestor.visible) shown = false
      })
      anchor.current.getWorldPosition(at)
      light.position.copy(at)
      light.distance = levels.distance
      light.intensity = shown ? levels.light * on : 0
    }
  })

  return { glow, anchor }
}
