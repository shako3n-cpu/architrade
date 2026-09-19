import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { HalfFloatType, Vector3, WebGLRenderTarget, type Group, type PerspectiveCamera, type PointLight } from 'three'
import { FurnishProvider } from './drop-in'
import { DURATION, LEAD_IN, leaveSpan, STAGGER, SWITCH_LEAD_IN } from './furnish-clock'
import type { HotspotStore } from './hotspot-store'
import { HOTSPOT_BY_ID, HOTSPOTS } from './hotspots'
import { LAMP_LIGHT_SLOTS, LampLightContext, type LampLightPool } from './lamp-light-pool'
import { PALETTE } from './palette'
import { Room } from './room'
import { CEILING, ROOM } from './room-geometry'
import type { ArmchairMode, RoomId } from './room-types'
import { ROOMS } from './room-registry'

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
 * The model's bounding box — slab, both walls, the cut ceiling — as its eight
 * corners, for fitting the stacked view to it.
 */
const MODEL_CORNERS = (() => {
  const { halfWidth, halfDepth, wallHeight, wallThickness, slabThickness } = ROOM
  const xs = [-halfWidth - wallThickness, halfWidth]
  const ys = [-slabThickness, wallHeight + CEILING.thickness]
  const zs = [-halfDepth - wallThickness, halfDepth]
  return xs.flatMap((x) => ys.flatMap((y) => zs.map((z) => new Vector3(x, y, z))))
})()

/** Stacked view: air either side of the model, and above it, in pixels. */
const FIT_SIDE = 0.035
const FIT_TOP = 14
/** The Replay row along the stage's bottom edge — kept clear of the model. */
const FIT_CONTROLS = 76

/** Where the model's corners land on a canvas `width` x `height`, with no view offset. */
function modelBounds(cam: PerspectiveCamera, width: number, height: number) {
  cam.clearViewOffset()
  cam.updateMatrixWorld()
  const p = new Vector3()
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const corner of MODEL_CORNERS) {
    p.copy(corner).project(cam)
    const x = ((p.x + 1) / 2) * width
    const y = ((1 - p.y) / 2) * height
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  return { minX, maxX, minY, maxY }
}

/**
 * Frames the room for the shape of the canvas it is in.
 *
 *   overlay   (desktop) the canvas is the whole hero and the headline sits
 *             over its left side, so the projection is shifted to push the
 *             room right — setViewOffset, not a moved target, so orbiting
 *             still turns about the middle of the room. Distances tuned by
 *             eye for each shape of window.
 *   stacked   (phone, tablet, a narrow window) the canvas is its own block
 *             under the text, and the view is FITTED rather than tuned: the
 *             camera backs off until the whole model — slab corners, wall
 *             ends, ceiling — lies inside the canvas with air either side,
 *             then the model is centred in the space above the Replay row.
 *             Tuned by eye, the phone view cut both corners of the slab off
 *             and left a band of empty stage under the room; desktop shows
 *             the model whole, and now every size does.
 *
 * The camera is only REPOSITIONED when the shape changes class — portrait,
 * square-ish, wide — not on every resize. A phone resizes the canvas every
 * time its address bar slides, and snapping the view back each time would
 * throw away whatever angle the visitor had turned it to. The stacked
 * centring is recomputed on every resize; it moves the picture, not the
 * camera.
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
    const W = size.width
    const H = size.height
    const aspect = W / H
    const shape = aspect < 0.9 ? 'portrait' : aspect < 1.45 ? 'square' : 'wide'
    const placeAt = (distance: number) => {
      cam.position.copy(TARGET).addScaledVector(CAMERA_DIR, distance)
      cam.lookAt(TARGET)
    }

    if (`${shape}:${layout}` !== lastClass.current) {
      lastClass.current = `${shape}:${layout}`
      // Far enough back that the whole slab, cut edge included, sits inside
      // the frame with air around it. A model shown whole reads as a model;
      // one cropped by the viewport reads as a room seen through a doorway.
      const tuned = shape === 'portrait' ? 15.5 : shape === 'square' ? 19 : 17.5
      cam.fov = shape === 'portrait' ? 34 : 26
      cam.aspect = aspect
      cam.updateProjectionMatrix()

      let distance = tuned
      if (layout === 'stacked') {
        const fits = (d: number) => {
          placeAt(d)
          const b = modelBounds(cam, W, H)
          return b.minX >= W * FIT_SIDE && b.maxX <= W * (1 - FIT_SIDE) && b.maxY - b.minY <= H - FIT_TOP - FIT_CONTROLS
        }
        // Never closer than tuned; otherwise the nearest distance that fits.
        if (!fits(tuned)) {
          let lo = tuned
          let hi = tuned * 3
          for (let i = 0; i < 18; i++) {
            const mid = (lo + hi) / 2
            if (fits(mid)) hi = mid
            else lo = mid
          }
          distance = hi
        }
      }
      placeAt(distance)
    }

    // Overlay: enough that the left wall's top edge clears the end of the
    // headline. Stacked: the model's own box, centred across the canvas and
    // in the space between its top edge and the Replay row.
    let shiftX = layout === 'overlay' ? -W * 0.165 : 0
    let shiftY = 0
    if (layout === 'stacked') {
      const b = modelBounds(cam, W, H)
      shiftX = (b.minX + b.maxX) / 2 - W / 2
      shiftY = (b.minY + b.maxY) / 2 - (FIT_TOP + (H - FIT_TOP - FIT_CONTROLS) / 2)
    }
    cam.setViewOffset(W, H, shiftX, shiftY, W, H)
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

/** A 1x1 off-screen target to compile against — see <Arrival>. Made once, on first use. */
let offscreen: WebGLRenderTarget | null = null
const compileTarget = () => (offscreen ??= new WebGLRenderTarget(1, 1, { type: HalfFloatType }))

/**
 * Holds a newly mounted room out of sight while its shaders compile, then
 * starts its sequence `lead` seconds out.
 *
 * three compiles a material's shader the first time something wearing it is
 * drawn — synchronously, on that frame. Every room brings materials the one
 * before it never drew (the Poly Haven models' re-dressed surfaces, the
 * linen, the stone, the black glass), and drawn straight away the bedroom
 * froze the page for 420ms on its first frame. So the room is handed to
 * `compileAsync` first, which queues every shader it needs on the driver's
 * own threads (KHR_parallel_shader_compile) and lets the render loop run on.
 * Only once they are all ready does the room become visible and its clock
 * start. The first piece then lands on a warm pipeline.
 *
 * Mounted inside the room's own Suspense boundary, so it only runs once every
 * model the room needs has loaded — a slow load cannot make a piece land
 * unseen.
 */
function Arrival({
  schedule,
  lead,
  reduced,
  children,
}: {
  /** Sets the clock time piece 0 starts at. Owned by <Rooms>. */
  schedule: (at: number) => void
  /** Seconds of empty room between the shaders being ready and the first piece. */
  lead: number
  reduced: boolean
  children: ReactNode
}) {
  const group = useRef<Group>(null)
  const get = useThree((state) => state.get)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    let live = true
    const { gl, camera, scene } = get()
    const begin = () => {
      if (!live) return
      setReady(true)
      if (!reduced) schedule(get().clock.elapsedTime + lead)
    }
    /*
     * Compiled as if into an off-screen target, because that is where the
     * room is drawn: the effect chain renders the scene into its own linear
     * buffer, and three builds the output colour space into every shader.
     * Compiled against the screen, the shaders came out as the sRGB variants —
     * right in every other way, never used — and the real ones still compiled
     * on the first frame. Rejected or not, the room is shown in the end: a
     * failed pre-compile only means compiling on first draw, as before.
     */
    const previous = gl.getRenderTarget()
    gl.setRenderTarget(compileTarget())
    const compiling = gl.compileAsync(root, camera, scene)
    gl.setRenderTarget(previous)
    compiling.then(begin, begin)
    return () => {
      live = false
    }
  }, [get, schedule, lead, reduced])

  return (
    <group ref={group} visible={ready}>
      {children}
    </group>
  )
}

/**
 * The room that is furnished, and the handover from one room to the next.
 *
 * A change of room is three beats, all on the render loop's clock:
 *
 *   1. CLEAR    `leave` is set to now. Every piece of the current room runs
 *               its drop backwards, last in first out (furnish-clock.ts), and
 *               the last is gone leaveSpan(pieces) seconds later.
 *   2. EMPTY    The next room is mounted — a new generation, so every piece
 *               starts shrunk and waiting — out of sight while its shaders
 *               compile in the background (<Arrival>), and the bare shell is
 *               held SWITCH_LEAD_IN beyond that.
 *   3. FURNISH  <Arrival> sets `start`, and the room drops in exactly as the
 *               first one did.
 *
 * Asking for another room while one is clearing only changes where it is
 * going; asking for the room already there does nothing. Under reduced
 * motion the whole thing is a cut: the next room is mounted at once, and
 * mounts finished.
 */
function Rooms({
  room,
  armchair,
  reduced,
  replayToken,
  hotspots,
}: {
  room: RoomId
  armchair: ArmchairMode
  reduced: boolean
  replayToken: number
  hotspots: HotspotStore
}) {
  /*
   * Infinity until set, so every piece is "not yet" — waiting shrunk to
   * nothing — and "not leaving". Reduced motion never sets `start`: it is
   * pinned "finished" inside furnish-clock.ts instead.
   */
  const start = useRef(Number.POSITIVE_INFINITY)
  const leave = useRef(Number.POSITIVE_INFINITY)
  const schedule = useCallback((at: number) => {
    start.current = at
  }, [])

  const get = useThree((state) => state.get)
  const [shown, setShown] = useState<{ room: RoomId; generation: number }>({ room, generation: 0 })

  /** The room to change to once the current one has cleared; null when none is. */
  const pending = useRef<RoomId | null>(null)
  const clearedAt = useRef(Number.POSITIVE_INFINITY)

  // Reduced motion: a cut, made during render — the documented way to keep
  // state in step with a prop — so the next room is on the very next frame.
  if (reduced && room !== shown.room) {
    setShown({ room, generation: shown.generation + 1 })
  }

  useEffect(() => {
    if (reduced || (pending.current === null && room === shown.room)) return

    if (pending.current === null) {
      const now = get().clock.elapsedTime
      leave.current = now
      clearedAt.current = now + leaveSpan(ROOMS[shown.room].pieces)
    }
    pending.current = room
  }, [room, shown.room, reduced, get])

  // The hotspots: live once the room's last piece has landed, fading in
  // over a third of a second; gone the instant the room starts to leave.
  useFrame(({ clock }, delta) => {
    const now = clock.elapsedTime
    const arrived = reduced || now >= start.current + (ROOMS[shown.room].pieces - 1) * STAGGER + DURATION
    const leaving = pending.current !== null || now >= leave.current
    hotspots.publish(shown.room, arrived && !leaving ? Math.min(1, hotspots.alpha + delta / 0.35) : 0)
  })

  useFrame(({ clock }) => {
    if (pending.current === null || clock.elapsedTime < clearedAt.current) return
    const next = pending.current
    pending.current = null
    clearedAt.current = Number.POSITIVE_INFINITY
    start.current = Number.POSITIVE_INFINITY
    leave.current = Number.POSITIVE_INFINITY
    setShown((current) => ({ room: next, generation: current.generation + 1 }))
  })

  // Replay: everything measures itself from the start time, so moving it to
  // now is the whole restart. Skipped for the token's initial value, and
  // while a room is clearing — the next one is about to arrive anyway.
  const firstToken = useRef(replayToken)
  useEffect(() => {
    if (replayToken === firstToken.current || pending.current !== null) return
    start.current = get().clock.elapsedTime + 0.15
  }, [replayToken, get])

  const { Layout, pieces } = ROOMS[shown.room]

  return (
    // Keyed by generation: each arrival is a fresh mount, so a room shown
    // twice in a row still starts from empty. Its own boundary, so a room
    // whose models are still loading suspends only itself — the shell and
    // the lights stay up.
    <Suspense key={shown.generation} fallback={null}>
      <FurnishProvider start={start} leave={leave} count={pieces} reduced={reduced}>
        <Arrival schedule={schedule} lead={shown.generation === 0 ? LEAD_IN : SWITCH_LEAD_IN} reduced={reduced}>
          <Layout armchair={armchair} />
        </Arrival>
      </FurnishProvider>
    </Suspense>
  )
}

/**
 * The scene's fixed pool of lamp lights, and the context the lamps borrow
 * them through — see lamp-light-pool.ts. Outside every Suspense boundary, so
 * the lights are in the scene before the first material is ever compiled,
 * and the count those shaders are built for is the count for good.
 */
function LampLights({ children }: { children: ReactNode }) {
  const lights = useRef<(PointLight | null)[]>([])
  const taken = useRef<boolean[]>(Array.from({ length: LAMP_LIGHT_SLOTS }, () => false))

  const pool = useMemo<LampLightPool>(
    () => ({
      light: (slot) => lights.current[slot] ?? null,
      claim: () => {
        const slot = taken.current.indexOf(false)
        if (slot < 0) return null
        taken.current[slot] = true
        return slot
      },
      release: (slot) => {
        taken.current[slot] = false
        const light = lights.current[slot]
        if (light) light.intensity = 0
      },
    }),
    [],
  )

  return (
    <LampLightContext.Provider value={pool}>
      {Array.from({ length: LAMP_LIGHT_SLOTS }, (_, slot) => (
        <pointLight
          key={slot}
          ref={(light) => {
            lights.current[slot] = light
          }}
          color={PALETTE.lampLight}
          intensity={0}
          decay={2}
        />
      ))}
      {children}
    </LampLightContext.Provider>
  )
}

/**
 * Moves each hotspot dot to where its piece is on the canvas, every frame —
 * after the camera has moved (OrbitControls updates at priority -1; this runs
 * at the default 0, and must: a positive priority would take over rendering), so a dot stays pinned to its piece while the
 * room is turned. The projection matrix carries the framing's view offset,
 * so a projected point lands in canvas pixels as drawn. A dot whose anchor
 * is behind the camera, or whose room is not the one showing, is hidden.
 */
function HotspotProjector({ store }: { store: HotspotStore }) {
  const point = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    const live = store.room ? HOTSPOTS[store.room] : []
    for (const id of store.ids()) {
      const hotspot = HOTSPOT_BY_ID.get(id)
      if (!hotspot) continue
      point.set(...hotspot.at).project(camera)
      const shown = live.includes(hotspot) && point.z < 1
      store.place(id, ((point.x + 1) / 2) * size.width, ((1 - point.y) / 2) * size.height, shown ? store.alpha : 0)
    }
  })

  return null
}

/* -------------------------------------------------------------------------- */
/* The canvas                                                                 */
/* -------------------------------------------------------------------------- */

export function RoomScene({
  room,
  replayToken,
  reduced,
  layout,
  coarsePointer,
  armchair,
  hotspots,
}: {
  /** Change it to clear the room and furnish it as another. */
  room: RoomId
  /** Change it to restart the sequence. */
  replayToken: number
  reduced: boolean
  layout: StageLayout
  coarsePointer: boolean
  armchair: ArmchairMode
  /** Where the hotspot overlay's dots are told where, and whether, to show. */
  hotspots: HotspotStore
}) {
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

      {/*
       * The shell suspends on its floor texture, so the room is never seen
       * with a flat floor that then changes. The furnishings have their own
       * boundary inside <Rooms>: a glTF model still loading suspends only
       * the room it belongs to.
       */}
      <LampLights>
        <Suspense fallback={null}>
          <Studio quality={quality} />
          <Room />
          <Rooms room={room} armchair={armchair} reduced={reduced} replayToken={replayToken} hotspots={hotspots} />
        </Suspense>
      </LampLights>

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
      <HotspotProjector store={hotspots} />
      {coarsePointer && <TouchScroll />}

      <Effects quality={quality} />
    </Canvas>
  )
}
