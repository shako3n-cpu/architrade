import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, PointsMaterial, type Points } from 'three'
import { IDLE } from './idle'
import { LIGHTING } from './lighting'
import { STAGE } from './stage-clock'
import { seeded } from './util'

/**
 * Dust in the light — see idle.ts. A few hundred motes drifting slowly in
 * the half of the room the window light crosses, each on its own small loop,
 * bright by day and barely there in the evening.
 *
 * One Points object, one draw call, positions updated on the CPU each frame
 * (a few hundred numbers — nothing). Not mounted on phones or on the cheaper
 * render setting, and hidden under reduced motion.
 */

const COUNT = 220

/** Where the motes drift: the window side of the room, from knee height to the ceiling. */
const BOX = { x: [-1.2, 2.8], y: [0.45, 2.55], z: [-2.2, 2.2] } as const

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

export function Dust() {
  const points = useRef<Points>(null)

  const { geometry, material, seeds } = useMemo(() => {
    const rand = seeded(61)
    const positions = new Float32Array(COUNT * 3)
    // Per mote: its home, the size of its loop, and its speed and phase.
    const seeds = Array.from({ length: COUNT }, () => ({
      x: BOX.x[0] + rand() * (BOX.x[1] - BOX.x[0]),
      y: BOX.y[0] + rand() * (BOX.y[1] - BOX.y[0]),
      z: BOX.z[0] + rand() * (BOX.z[1] - BOX.z[0]),
      r: 0.05 + rand() * 0.14,
      s: 0.05 + rand() * 0.09,
      p: rand() * Math.PI * 2,
    }))
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    const material = new PointsMaterial({
      color: '#fff1d9',
      size: 0.034,
      map: spriteTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    })
    return { geometry, material, seeds }
  }, [])

  useFrame(() => {
    const p = points.current
    if (!p) return
    p.visible = IDLE.enabled
    if (!IDLE.enabled) return

    const t = STAGE.now
    // Through the object, not the memoised values it was built from.
    const position = p.geometry.attributes.position as BufferAttribute
    for (let i = 0; i < COUNT; i++) {
      const m = seeds[i]
      const a = t * m.s + m.p
      // A slow loop round its home, and a very slow sink and rise.
      position.setXYZ(
        i,
        m.x + Math.cos(a) * m.r,
        m.y + Math.sin(a * 0.7) * m.r * 0.6 + Math.sin(t * 0.05 + m.p) * 0.08,
        m.z + Math.sin(a * 1.3) * m.r,
      )
    }
    position.needsUpdate = true
    // Motes show in the day's light; in the evening they all but vanish.
    ;(p.material as PointsMaterial).opacity = 0.7 * (1 - 0.8 * LIGHTING.evening) * IDLE.breath
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}
