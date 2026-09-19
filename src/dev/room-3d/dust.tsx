import { useContext, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, PointsMaterial, type Points } from 'three'
import { IDLE } from './idle'
import { LAMP_LIGHT_SLOTS, LampLightContext } from './lamp-light-pool'
import { LIGHTING } from './lighting'
import { STAGE } from './stage-clock'
import { seeded } from './util'

/**
 * ============================================================================
 * DUST IN THE LIGHT
 * ----------------------------------------------------------------------------
 * Two kinds of mote — see idle.ts:
 *
 *   HAZE   a few hundred drifting in the half of the room the window light
 *          crosses. Bright by day, gone by evening.
 *
 *   BEAMS  motes that live INSIDE the cone under a lamp — the shaft of dust
 *          a pendant throws over a counter, which is the thing that makes an
 *          architectural render look photographed. Off by day, up in the
 *          evening with the lamps.
 *
 * WHY THE BEAM MOTES ARE NOT JUST MORE HAZE
 *   Scattered through the room, only about one mote in a hundred happens to
 *   be under a lamp, and a beam needs dozens: spread evenly, a field dense
 *   enough to draw the cone is a fog everywhere else. So a beam's motes are
 *   held in the cone's OWN frame — an angle, a distance out, a depth below
 *   the bulb — and placed each frame against whichever pooled light is lit
 *   (lamp-light-pool.ts). The lamps change with the room and with the hour;
 *   the beams follow, and a dark lamp simply has none.
 *
 * All of it is two draw calls, and a loop of a few hundred numbers per frame
 * on the CPU. Not mounted on phones or on the cheaper render setting, and
 * hidden under reduced motion.
 * ============================================================================
 */

/** Motes in the window haze, and in each lamp's cone. */
const HAZE_COUNT = 220
const BEAM_COUNT = 110

/** Where the haze drifts: the window side, from knee height to the ceiling. */
const BOX = { x: [-1.2, 2.8], y: [0.45, 2.55], z: [-2.2, 2.2] } as const

/** How bright the haze and a beam go, before the breath. */
const HAZE_GLOW = 0.7
const BEAM_GLOW = 1.4

/**
 * How big a mote is drawn, in metres. A beam's are larger — the haze is a
 * field seen across the whole room, a beam is a shaft a couple of metres
 * long seen from fifteen, and at the haze's size its motes came out under a
 * pixel each and simply were not there.
 */
const HAZE_SIZE = 0.034
const BEAM_SIZE = 0.085

/** A cone: this wide at the bulb, opening by this much per metre below it. */
const CONE_AT_BULB = 0.16
const CONE_SPREAD = 0.42

/** How far below its bulb a cone reaches, at most. Metres. */
const CONE_DROP = 2.1

/** The warm tint of a beam mote, and the cooler one of the day's haze. */
const BEAM_TINT = [1, 0.8, 0.56] as const
const HAZE_TINT = [1, 0.95, 0.85] as const

/** A soft round sprite, so a mote is a speck of light and not a square. */
function spriteTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new CanvasTexture(canvas)
}

/** A haze mote: its home in the room, the size of its loop, its speed and phase. */
type Haze = { x: number; y: number; z: number; r: number; s: number; p: number }

/** A beam mote: where it sits in its cone, and how it drifts through it. */
type Beam = { angle: number; out: number; depth: number; drift: number; spin: number; p: number }

export function Dust() {
  const hazeRef = useRef<Points>(null)
  const beamRef = useRef<Points>(null)
  const pool = useContext(LampLightContext)

  const { hazeGeometry, hazeMaterial, beamGeometry, beamMaterial, haze, beams } = useMemo(() => {
    const rand = seeded(61)
    const haze: Haze[] = Array.from({ length: HAZE_COUNT }, () => ({
      x: BOX.x[0] + rand() * (BOX.x[1] - BOX.x[0]),
      y: BOX.y[0] + rand() * (BOX.y[1] - BOX.y[0]),
      z: BOX.z[0] + rand() * (BOX.z[1] - BOX.z[0]),
      r: 0.05 + rand() * 0.14,
      s: 0.05 + rand() * 0.09,
      p: rand() * Math.PI * 2,
    }))
    const beams: Beam[] = Array.from({ length: BEAM_COUNT * LAMP_LIGHT_SLOTS }, () => ({
      angle: rand() * Math.PI * 2,
      // Square-rooted, so motes are not bunched at the cone's axis.
      out: Math.sqrt(rand()),
      depth: rand(),
      drift: 0.01 + rand() * 0.03,
      spin: (rand() - 0.5) * 0.12,
      p: rand() * Math.PI * 2,
    }))

    // Two objects rather than one, only so that a beam's motes can be drawn
    // larger than the haze's; everything else about them is the same.
    const sprite = spriteTexture()
    const field = (count: number, size: number) => {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
      // Black until the first frame lights each mote by what is shining on it.
      geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3))
      const material = new PointsMaterial({
        size,
        map: sprite,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
        vertexColors: true,
      })
      return { geometry, material }
    }
    const hazeField = field(HAZE_COUNT, HAZE_SIZE)
    const beamField = field(BEAM_COUNT * LAMP_LIGHT_SLOTS, BEAM_SIZE)
    return {
      hazeGeometry: hazeField.geometry,
      hazeMaterial: hazeField.material,
      beamGeometry: beamField.geometry,
      beamMaterial: beamField.material,
      haze,
      beams,
    }
  }, [])

  useFrame(() => {
    const hazePoints = hazeRef.current
    const beamPoints = beamRef.current
    if (!hazePoints || !beamPoints) return
    hazePoints.visible = IDLE.enabled
    beamPoints.visible = IDLE.enabled
    if (!IDLE.enabled) return

    const t = STAGE.now
    const evening = LIGHTING.evening
    // Through the objects, not the memoised values they were built from.
    const hazePosition = hazePoints.geometry.attributes.position as BufferAttribute
    const hazeColor = hazePoints.geometry.attributes.color as BufferAttribute
    const beamPosition = beamPoints.geometry.attributes.position as BufferAttribute
    const beamColor = beamPoints.geometry.attributes.color as BufferAttribute

    /* The haze: the day's, fading out as the evening comes up. */
    const glow = HAZE_GLOW * (1 - evening)
    for (let i = 0; i < HAZE_COUNT; i++) {
      const m = haze[i]
      const a = t * m.s + m.p
      // A slow loop round its home, and a very slow sink and rise.
      hazePosition.setXYZ(
        i,
        m.x + Math.cos(a) * m.r,
        m.y + Math.sin(a * 0.7) * m.r * 0.6 + Math.sin(t * 0.05 + m.p) * 0.08,
        m.z + Math.sin(a * 1.3) * m.r,
      )
      hazeColor.setXYZ(i, glow * HAZE_TINT[0], glow * HAZE_TINT[1], glow * HAZE_TINT[2])
    }

    /* The beams: one cone per pooled light, wherever it is and while it is lit. */
    for (let slot = 0; slot < LAMP_LIGHT_SLOTS; slot++) {
      const first = slot * BEAM_COUNT
      const light = pool?.light(slot) ?? null
      const power = light ? Math.min(light.intensity / 5, 1) * evening : 0

      if (!light || power <= 0.001) {
        // Dark: nothing to draw. Left where they were, at no brightness.
        for (let i = first; i < first + BEAM_COUNT; i++) beamColor.setXYZ(i, 0, 0, 0)
        continue
      }

      // The cone stops at the floor if the lamp hangs lower than its full drop.
      const drop = Math.min(CONE_DROP, Math.max(light.position.y - 0.05, 0.3))
      for (let i = 0; i < BEAM_COUNT; i++) {
        const m = beams[first + i]
        // Sinking slowly through the cone and turning round it, and over at
        // the top again — so a beam is never still and never empties.
        const depth = (m.depth + t * m.drift) % 1
        const angle = m.angle + t * m.spin
        const out = m.out * (0.92 + 0.08 * Math.sin(t * 0.6 + m.p))
        const spread = (CONE_AT_BULB + CONE_SPREAD * depth * drop) * out
        beamPosition.setXYZ(
          first + i,
          light.position.x + Math.cos(angle) * spread,
          light.position.y - depth * drop,
          light.position.z + Math.sin(angle) * spread,
        )
        // Brightest close under the bulb and along the cone's axis, and
        // fading out towards the bottom rather than stopping at an edge.
        const alongCone = (1 - depth) ** 0.7
        const acrossCone = (1 - out) ** 1.5
        const lit = BEAM_GLOW * power * alongCone * acrossCone
        beamColor.setXYZ(first + i, lit * BEAM_TINT[0], lit * BEAM_TINT[1], lit * BEAM_TINT[2])
      }
    }

    hazePosition.needsUpdate = true
    hazeColor.needsUpdate = true
    beamPosition.needsUpdate = true
    beamColor.needsUpdate = true
    // The breath (idle.ts) carries both fields; how bright any one mote is,
    // is its own, above.
    ;(hazePoints.material as PointsMaterial).opacity = IDLE.breath
    ;(beamPoints.material as PointsMaterial).opacity = IDLE.breath
  })

  return (
    <>
      <points ref={hazeRef} geometry={hazeGeometry} material={hazeMaterial} frustumCulled={false} />
      <points ref={beamRef} geometry={beamGeometry} material={beamMaterial} frustumCulled={false} />
    </>
  )

}
