import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Vector3, type PerspectiveCamera } from 'three'
import { DropIn, FurnishProvider } from './drop-in'
import { LEAD_IN } from './furnish-clock'
import {
  Armchair,
  Bookshelf,
  CoffeeTable,
  COFFEE_TABLE_TOP,
  FloorLamp,
  Plant,
  Rug,
  SIDE_TABLE_TOP,
  SideTable,
  Sofa,
  TableStyling,
  Vase,
  WallArt,
} from './furniture'
import { PALETTE } from './palette'
import { Room } from './room'

/**
 * ============================================================================
 * THE STAGE
 * ----------------------------------------------------------------------------
 * Lit like a product shot, not like a game level:
 *
 *   ENVIRONMENT   a studio built from Lightformers — a big soft box overhead,
 *                 a warm "window" strip to the right, a low front fill, a rim
 *                 from the left and one ring for the brass to catch. Rendered
 *                 once into a cube map. No HDRI file, nothing fetched: drei's
 *                 Environment only reaches for its CDN when given a preset or
 *                 a file, and this gives it neither.
 *
 *   KEY LIGHT     one directional light from the front right, casting the
 *                 only real shadows, softened by three's own PCF filtering
 *                 (see <Studio> for why not drei's PCSS).
 *
 *   POST          ambient occlusion (N8AO) for the contact darkening that
 *                 makes furniture sit ON the floor; bloom, thresholded above
 *                 1.0 so only the lamp and hot brass highlights glow; a
 *                 shallow depth of field centred on the coffee table; the
 *                 Khronos PBR Neutral tone mapper; the faintest vignette.
 *
 * WHY PBR NEUTRAL AND NOT AgX OR ACES
 *   Neutral was designed for exactly this — e-commerce product rendering. It
 *   leaves colours below the highlights essentially untouched, so graphite
 *   stays graphite and the off-white stage meets the page's off-white. AgX and
 *   ACES both shift and desaturate mid-tones, which is right for a film and
 *   wrong for a brand palette.
 * ============================================================================
 */

/** What the camera orbits: roughly the middle of the furnished area. */
const TARGET = new Vector3(-0.3, 0.72, -0.55)

/** Direction from TARGET to the camera: front right, about 17° above level. */
const CAMERA_DIR = new Vector3(0.62, 0.3, 0.72).normalize()
const AZIMUTH = Math.atan2(CAMERA_DIR.x, CAMERA_DIR.z)
const POLAR = Math.acos(CAMERA_DIR.y)

/** How the canvas sits on the page — changes the framing, see <Framing>. */
export type StageLayout = 'overlay' | 'stacked'

type Quality = 'high' | 'low'

/* -------------------------------------------------------------------------- */
/* The furnished room, in drop order                                          */
/* -------------------------------------------------------------------------- */

/**
 * The layout, in the order the pieces arrive. Rug first so everything else
 * lands on it; the small things that sit ON other pieces last, so their
 * surface is already there when they drop.
 *
 * Spin alternates in sign so the room does not appear to be turning as a
 * whole. The rug, print and table-top pieces barely turn at all: a rug that
 * spins on the way down reads as thrown, not placed.
 */
function Furnishings() {
  return (
    <>
      <DropIn index={0} position={[0.1, 0, 0.25]} height={0.9} spin={0.08}>
        <Rug />
      </DropIn>

      <DropIn index={1} position={[0.2, 0, -1.97]} spin={-0.28}>
        <Sofa />
      </DropIn>

      <DropIn index={2} position={[0.2, 0, 0.15]} spin={0.34}>
        <CoffeeTable />
      </DropIn>

      {/* Turned to face the coffee table. */}
      <DropIn index={3} position={[1.85, 0, 0.6]} rotationY={-1.84} spin={-0.36}>
        <Armchair />
      </DropIn>

      <DropIn index={4} position={[-1.45, 0, -1.7]} spin={0.22}>
        <FloorLamp index={4} />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={5} position={[-2.8, 0, -0.35]} rotationY={Math.PI / 2} spin={-0.2}>
        <Bookshelf />
      </DropIn>

      <DropIn index={6} position={[2.1, 0, -0.45]} spin={0.3}>
        <SideTable />
      </DropIn>

      <DropIn index={7} position={[-2.42, 0, -2.05]} spin={-0.4}>
        <Plant />
      </DropIn>

      <DropIn index={8} position={[0.2, 1.22, -2.5]} height={1.1} spin={0}>
        <WallArt />
      </DropIn>

      <DropIn index={9} position={[2.1, SIDE_TABLE_TOP, -0.45]} height={0.9} spin={0.5}>
        <Vase />
      </DropIn>

      <DropIn index={10} position={[0.2, COFFEE_TABLE_TOP, 0.15]} height={0.8} spin={-0.12}>
        <TableStyling />
      </DropIn>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Lighting                                                                   */
/* -------------------------------------------------------------------------- */

function Studio({ quality }: { quality: Quality }) {
  return (
    <>
      {/*
       * SOFT SHADOWS ARE THREE'S OWN, NOT drei's <SoftShadows>.
       *
       * drei's version works by rewriting three's shadow shader, and the code
       * it writes calls `unpackRGBAToDepth` against a shadow map that three
       * 0.186 no longer stores that way. Every material that receives a shadow
       * then fails to compile — which is every material in this room — and the
       * scene renders as an empty background. No warning at build time; one
       * wall of shader errors in the console.
       *
       * It is also no longer needed. 0.186's PCF path samples the shadow map
       * with hardware depth comparison over a Vogel disk and honours
       * `shadow.radius`, so a radius is all a soft shadow takes. What PCSS
       * added on top — shadows hardening where an object meets the floor — is
       * supplied here by N8AO's contact darkening instead.
       */}
      {/* Near-white with the faintest warmth. The key carries the shadows, so
          it is set well above the studio: the first pass had the environment
          so bright that the shadows it cast barely registered. */}
      <directionalLight
        position={[5.5, 8, 4.5]}
        intensity={3.8}
        color="#fffaf3"
        castShadow
        // Soft, but not so soft it disappears. At 14 the five-tap filter spread
        // each shadow so thin that the armchair cast almost nothing on the rug.
        shadow-radius={quality === 'high' ? 6 : 4}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />

      <Environment resolution={256} frames={1} environmentIntensity={0.45}>
        {/* The studio's own ambient — a neutral grey, so shadowed sides are
            never a dead black and never tinted. */}
        <color attach="background" args={['#d4d3d0']} />

        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 7, 1]} scale={[12, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[9, 3.5, 3]} scale={[7, 3.2, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#ffffff" position={[0, 2, 12]} scale={[12, 3, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[-10, 3, -1]} scale={[5, 5, 1]} target={[0, 1, 0]} />
        {/* The ring is for the brass: a crisp, recognisable highlight is what
            makes metal read as metal rather than as yellow paint. */}
        <Lightformer form="ring" intensity={4} color="#ffffff" position={[4, 5, 7]} scale={1.6} target={[0, 0, 0]} />
      </Environment>
    </>
  )
}

function Effects({ quality }: { quality: Quality }) {
  const high = quality === 'high'

  return (
    <EffectComposer multisampling={high ? 4 : 0}>
      <N8AO
        aoRadius={0.75}
        distanceFalloff={0.6}
        intensity={4}
        quality={high ? 'high' : 'medium'}
        halfRes={!high}
        color={PALETTE.graphiteDeep}
      />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.45} radius={0.7} />
      {/* Focus on the coffee table, the middle of the arrangement. The range is
          set so the furniture group stays sharp and only the far corner and
          the near edge of the slab fall off — a lens, not a blur filter. At
          the first value tried (6m) it covered the whole room and did nothing. */}
      <DepthOfField target={[0.2, 0.4, 0.15]} worldFocusRange={4.4} bokehScale={high ? 2.2 : 1.2} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      {/* Barely there. Any stronger and the stage's bottom edge turns grey where
          it meets the off-white page beneath the hero. */}
      <Vignette offset={0.4} darkness={0.14} />
    </EffectComposer>
  )
}

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Frames the room for the shape of the canvas it is in.
 *
 *   overlay   (desktop) the canvas is the whole hero and the headline sits
 *             over its left side, so the projection is shifted to push the
 *             room right — setViewOffset, not a moved target, so orbiting
 *             still turns about the middle of the room.
 *   stacked   (phone) the canvas is its own portrait block under the text;
 *             the camera widens and backs off, because a portrait frame is
 *             narrow and the room is wide, and the room is lifted a little
 *             so more of it lands in the first screen.
 *
 * The camera is only REPOSITIONED when the shape changes class — portrait,
 * square-ish, wide — not on every resize. A phone resizes the canvas every
 * time its address bar slides, and snapping the view back each time would
 * throw away whatever angle the visitor had turned it to.
 */
function Framing({ layout }: { layout: StageLayout }) {
  // The camera is read through `get()` inside the effect rather than taken
  // from the hook: it belongs to the render loop, not to React, and is
  // changed here on the loop's behalf.
  const get = useThree((state) => state.get)
  const size = useThree((state) => state.size)
  const lastClass = useRef<string>('')

  useLayoutEffect(() => {
    const { camera, controls } = get()
    const cam = camera as PerspectiveCamera
    const aspect = size.width / size.height
    const shape = aspect < 0.9 ? 'portrait' : aspect < 1.45 ? 'square' : 'wide'

    if (shape !== lastClass.current) {
      lastClass.current = shape
      // Far enough back that the whole slab, cut edge included, sits inside
      // the frame with air around it. A model shown whole reads as a model;
      // one cropped by the viewport reads as a room seen through a doorway.
      const distance = shape === 'portrait' ? 15.5 : shape === 'square' ? 19 : 17.5
      cam.fov = shape === 'portrait' ? 34 : 26
      cam.position.copy(TARGET).addScaledVector(CAMERA_DIR, distance)
    }

    // Overlay: enough that the left wall's top edge clears the end of the
    // headline. Stacked: lifted, because the stage starts partway down a
    // phone's first screen and the room was sitting in its lower half, below
    // the fold, with empty stage above it.
    const shiftX = layout === 'overlay' ? -size.width * 0.165 : 0
    const shiftY = layout === 'stacked' ? size.height * 0.1 : 0
    cam.setViewOffset(size.width, size.height, shiftX, shiftY, size.width, size.height)
    cam.updateProjectionMatrix()
    ;(controls as { update?: () => void } | null)?.update?.()
  }, [get, layout, size.width, size.height])

  return null
}

/**
 * Turning without trapping the page.
 *
 * OrbitControls sets `touch-action: none` on the canvas, which on a phone
 * means a thumb that lands on the room can never scroll past it — and this
 * canvas is most of the first screen. `pan-y` hands vertical swipes back to
 * the browser, so the page scrolls, while horizontal drags still reach the
 * controls and turn the room. Polar rotation is locked on touch to match:
 * there is no vertical drag left to drive it.
 */
function TouchScroll() {
  // Subscribed to so this re-runs once makeDefault has registered the
  // controls — which happens in their own effect, after connect() has set
  // `none`. Read back through get() so the element is not a hook's return.
  const controls = useThree((state) => state.controls)
  const get = useThree((state) => state.get)

  useEffect(() => {
    const element = (get().controls as { domElement?: HTMLElement } | null)?.domElement
    if (element) element.style.touchAction = 'pan-y'
  }, [controls, get])

  return null
}

/**
 * Starts the sequence once the canvas has actually drawn a few frames.
 *
 * The first frame is where every shader compiles, and on a slow machine that
 * can take longer than the whole lead-in. Starting the clock from mount would
 * mean the first two pieces had already landed, unseen, by the time anything
 * appeared. Counting frames starts it from the first frame someone can see.
 */
function Starter({
  schedule,
  reduced,
  replayToken,
}: {
  /** Sets the clock time piece 0 starts at. Owned by RoomScene. */
  schedule: (at: number) => void
  reduced: boolean
  replayToken: number
}) {
  const frames = useRef(0)
  const get = useThree((state) => state.get)

  useFrame(({ clock }) => {
    frames.current += 1
    if (frames.current === 3 && !reduced) schedule(clock.elapsedTime + LEAD_IN)
  })

  // Replay: everything measures itself from the start time, so moving it to
  // now is the whole restart. Skipped for the token's initial value.
  const firstToken = useRef(replayToken)
  useEffect(() => {
    if (replayToken === firstToken.current) return
    schedule(get().clock.elapsedTime + 0.15)
  }, [replayToken, get, schedule])

  return null
}

/* -------------------------------------------------------------------------- */
/* The canvas                                                                 */
/* -------------------------------------------------------------------------- */

export function RoomScene({
  replayToken,
  reduced,
  layout,
  coarsePointer,
}: {
  /** Change it to restart the sequence. */
  replayToken: number
  reduced: boolean
  layout: StageLayout
  coarsePointer: boolean
}) {
  /*
   * Infinity until <Starter> sets it, so every piece is "not yet" and waits
   * shrunk to nothing. Reduced motion never sets it: it is pinned "finished"
   * inside furnish-clock.ts instead, so `start` is simply unused.
   */
  const start = useRef(Number.POSITIVE_INFINITY)
  const schedule = useCallback((at: number) => {
    start.current = at
  }, [])

  // Phones start on the cheaper settings; PerformanceMonitor drops anything
  // else that turns out to struggle. It never climbs back up — flickering
  // between the two is worse than staying on the cheaper one.
  const [quality, setQuality] = useState<Quality>(coarsePointer ? 'low' : 'high')

  return (
    <Canvas
      // PCFShadowMap, explicitly. `shadows` alone asks for PCFSoftShadowMap,
      // which 0.186 has removed and falls back from with a console warning.
      shadows="percentage"
      // No renderer tone mapping: it is applied in the effect chain, where it
      // belongs once there IS an effect chain.
      flat
      dpr={[1, quality === 'high' ? 2 : 1.5]}
      camera={{ fov: 26, near: 0.5, far: 60, position: TARGET.clone().addScaledVector(CAMERA_DIR, 17.5).toArray() }}
      gl={{ antialias: false, stencil: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <color attach="background" args={[PALETTE.stage]} />

      <PerformanceMonitor onDecline={() => setQuality('low')} />

      <FurnishProvider start={start} reduced={reduced}>
        <Starter schedule={schedule} reduced={reduced} replayToken={replayToken} />
        <Studio quality={quality} />
        <Room />
        <Furnishings />
      </FurnishProvider>

      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        // Off, because the wheel belongs to the page: this canvas fills the
        // first screen, and a wheel that zoomed the room would stop anyone
        // scrolling past it.
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        minAzimuthAngle={AZIMUTH - 0.62}
        maxAzimuthAngle={AZIMUTH + 0.55}
        minPolarAngle={coarsePointer ? POLAR : POLAR - 0.3}
        maxPolarAngle={coarsePointer ? POLAR : POLAR + 0.12}
      />

      <Framing layout={layout} />
      {coarsePointer && <TouchScroll />}

      <Effects quality={quality} />
    </Canvas>
  )
}
