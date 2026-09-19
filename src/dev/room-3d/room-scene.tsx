import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import {
  Color,
  HalfFloatType,
  Vector3,
  WebGLRenderTarget,
  type DirectionalLight,
  type Group,
  type PerspectiveCamera,
  type PointLight,
} from 'three'
import { FurnishProvider } from './drop-in'
import { ENTER_DELAY, INTRO, LEAD_IN, RoomClock, switchTiming } from './furnish-clock'
import type { HotspotStore } from './hotspot-store'
import { HOTSPOT_BY_ID, HOTSPOTS } from './hotspots'
import { LAMP_LIGHT_SLOTS, LampLightContext, type LampLightPool } from './lamp-light-pool'
import { FABRICS, FLOOR_GRADE, FLOORS, WALLS, type Finishes } from './finishes'
import { RIG, SCROLL_PUSH, beginIntro, clearIntro, introPull, restartIntro } from './camera-rig'
import { fitBesideCopy, type Rect } from './framing-fit'
import { Dust } from './dust'
import { IDLE } from './idle'
import { COVE, LIGHTING, MOODS, WASH, type TimeOfDay } from './lighting'
import { M } from './materials'
import { PALETTE } from './palette'
import { Room } from './room'
import { CEILING, ROOM } from './room-geometry'
import { ROOM_IDS, type ArmchairMode, type RoomId } from './room-types'
import { ROOMS } from './room-registry'
import { STAGE, StageClock } from './stage-clock'

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

/** Seconds a change between day and evening takes. */
const MOOD_FADE = 0.7

function Studio({ quality, timeOfDay, reduced }: { quality: Quality; timeOfDay: TimeOfDay; reduced: boolean }) {
  const sun = useRef<DirectionalLight>(null)
  // Starts AT the first mood — the page opens in it, it does not fade into it.
  const mix = useRef(timeOfDay === 'evening' ? 1 : 0)

  /*
   * Day and evening, faded: see lighting.ts. The sun's position, colour and
   * strength, the studio's ambient, the cove light, and — through LIGHTING,
   * which useLampGlow reads — every lamp. Intensities and colours only: the
   * same lights exist in both, so the toggle recompiles nothing.
   */
  useFrame((state) => {
    const target = timeOfDay === 'evening' ? 1 : 0
    const gap = target - mix.current
    mix.current += Math.sign(gap) * Math.min(Math.abs(gap), STAGE.step / MOOD_FADE)
    const e = mix.current * mix.current * (3 - 2 * mix.current)
    const day = MOODS.day
    const night = MOODS.evening

    LIGHTING.evening = e
    const light = sun.current
    if (light) {
      light.position.lerpVectors(day.sun.position, night.sun.position, e)
      light.color.lerpColors(day.sun.color, night.sun.color, e)
      // The breath — idle.ts: the light easing up and down by a few percent
      // over some seconds, like cloud passing the window. The contact shadows
      // read the same value, so the room seems to breathe as one.
      IDLE.enabled = !reduced
      const t = STAGE.now
      IDLE.breath = reduced ? 1 : 1 + 0.035 * Math.sin(t * 0.21) + 0.015 * Math.sin(t * 0.57 + 1.3)
      light.intensity = (day.sun.intensity + (night.sun.intensity - day.sun.intensity) * e) * IDLE.breath
    }
    state.scene.environmentIntensity = day.ambient + (night.ambient - day.ambient) * e
    COVE.emissiveIntensity = 4 * (day.cove + (night.cove - day.cove) * e)
    WASH.opacity = 0.55 * (day.cove + (night.cove - day.cove) * e)
  })

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
      {/* The key — the sun by day, the moon by evening; <Studio> above moves
          it between the two. It carries the shadows, so by day it is set well
          above the studio: the first pass had the environment so bright that
          the shadows it cast barely registered. */}
      <directionalLight
        ref={sun}
        position={MOODS.day.sun.position.toArray()}
        intensity={MOODS.day.sun.intensity}
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

      {/* Its intensity is set every frame by <Studio>, for day and evening. */}
      <Environment resolution={256} frames={1}>
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

/** The floor slab's eight corners — what must stay clear of the copy. See framing-fit.ts. */
const FLOOR_CORNERS = (() => {
  const { halfWidth, halfDepth, wallThickness, slabThickness } = ROOM
  const xs = [-halfWidth - wallThickness, halfWidth]
  const ys = [-slabThickness, 0]
  const zs = [-halfDepth - wallThickness, halfDepth]
  return xs.flatMap((x) => ys.flatMap((y) => zs.map((z) => new Vector3(x, y, z))))
})()

/** The back-left quadrant, floor to 2.3m, where every room stands its tall pieces. See framing-fit.ts. */
const TALL_CORNERS = (() => {
  const xs = [-ROOM.halfWidth, -1.2]
  const ys = [0, 2.3]
  const zs = [-ROOM.halfDepth, 0.3]
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
function Framing({ layout, copyRect, reduced }: { layout: StageLayout; copyRect: Rect | null; reduced: boolean }) {
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
      RIG.baseDistance = distance
    }

    // Overlay: fitted beside the copy (framing-fit.ts) — the largest room,
    // up to a fifth larger than the old tuned framing, whose outline clears
    // the copy and the Replay row, as near the stage's middle as the copy
    // allows. Worked out on the default line of sight, then applied along the
    // visitor's own, so a resize never undoes their drag.
    // Stacked: the model's own box, centred across the canvas and in the
    // space between its top edge and the Replay row.
    let shiftX = layout === 'overlay' ? -W * 0.165 : 0
    let shiftY = 0
    if (layout === 'overlay' && copyRect) {
      const tuned = shape === 'portrait' ? 15.5 : shape === 'square' ? 19 : 17.5
      const direction = cam.position.clone().sub(TARGET).normalize()
      cam.aspect = aspect
      cam.updateProjectionMatrix()
      const fit = fitBesideCopy(cam, MODEL_CORNERS, [FLOOR_CORNERS, TALL_CORNERS], W, H, copyRect, tuned, placeAt)
      const distance = fit ? fit.distance : tuned
      cam.position.copy(TARGET).addScaledVector(direction, distance)
      cam.lookAt(TARGET)
      RIG.baseDistance = distance
      if (fit) {
        shiftX = fit.shiftX
        shiftY = fit.shiftY
      }
    }
    if (layout === 'stacked') {
      const b = modelBounds(cam, W, H)
      shiftX = (b.minX + b.maxX) / 2 - W / 2
      shiftY = (b.minY + b.maxY) / 2 - (FIT_TOP + (H - FIT_TOP - FIT_CONTROLS) / 2)
    }
    /*
     * The opening move, applied here as well as in <ScrollDolly> — the fit
     * above needs the true distance, but the camera must not be LEFT at it:
     * the first frame after this effect would show the settled framing and
     * the next would jump out to the wider opening. See camera-rig.ts.
     */
    const pull = reduced ? 1 : introPull(STAGE.now)
    if (pull !== 1) {
      const direction = cam.position.clone().sub(TARGET).normalize()
      cam.position.copy(TARGET).addScaledVector(direction, RIG.baseDistance * pull)
      cam.lookAt(TARGET)
    }

    cam.setViewOffset(W, H, shiftX, shiftY, W, H)
    cam.updateProjectionMatrix()
    ;(controls as { update?: () => void } | null)?.update?.()
  }, [get, layout, size.width, size.height, copyRect, reduced])

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
  clock,
  lead,
  reduced,
  children,
}: {
  /** The room's clock, scheduled once its shaders are ready. */
  clock: RoomClock
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
    const begin = () => {
      if (!live) return
      setReady(true)
      clock.markReady()
      if (reduced) return
      clock.schedule(STAGE.now + lead)
      // The camera settles in as the first room does — camera-rig.ts. Only
      // the first room to arrive starts it; a later one finds it done.
      beginIntro(STAGE.now + lead)
    }
    compileOffscreen(get, root).then(begin, begin)
    return () => {
      live = false
    }
  }, [get, clock, lead, reduced])

  return (
    <group ref={group} visible={ready}>
      {children}
    </group>
  )
}

/**
 * Compiled as if into an off-screen target, because that is where the room
 * is drawn: the effect chain renders the scene into its own linear buffer,
 * and three builds the output colour space into every shader. Compiled
 * against the screen, the shaders came out as the sRGB variants — right in
 * every other way, never used — and the real ones still compiled on the
 * first frame. Rejected or not, the caller carries on: a failed pre-compile
 * only means compiling on first draw.
 *
 * And never waited on for more than COMPILE_WAIT. compileAsync settles only
 * once the driver reports every program ready; should one never be — a lost
 * context, a driver that never answers — the room waiting on it would never
 * appear, and under reduced motion the room it replaces would never go. A
 * room drawn a moment early compiles on its first frame: a hitch, not a hang.
 */
const COMPILE_WAIT = 2500

function compileOffscreen(get: () => RootState, root: Group) {
  const { gl, camera, scene } = get()
  const previous = gl.getRenderTarget()
  gl.setRenderTarget(compileTarget())
  const compiling = gl.compileAsync(root, camera, scene)
  gl.setRenderTarget(previous)
  return Promise.race([compiling, new Promise((resolve) => window.setTimeout(resolve, COMPILE_WAIT))])
}

/**
 * Prepares one room nobody has asked for yet, so that asking for it later is
 * instant: mounts it hidden, compiles its shaders off the main thread, then
 * lets it draw — every piece still shrunk to nothing, its clock never
 * started — for a few frames, which uploads its textures and geometry. Then
 * it reports done and is unmounted.
 *
 * What it leaves behind is the GPU's copy: compiled programs and uploaded
 * buffers stay with the renderer, keyed by what they are rather than by
 * which object asked for them, so the room's real mount later finds them
 * all ready. That only holds because no room's materials are disposed on
 * unmount — see useLampGlow — since disposing releases the program.
 */
function WarmUp({ room, armchair, onDone }: { room: RoomId; armchair: ArmchairMode; onDone: (room: RoomId) => void }) {
  const { Layout, pieces } = ROOMS[room]
  const [clock] = useState(() => new RoomClock(INTRO))
  const group = useRef<Group>(null)
  const get = useThree((state) => state.get)
  const [compiled, setCompiled] = useState(false)
  const frames = useRef(0)

  useLayoutEffect(() => {
    const root = group.current
    if (!root) return
    let live = true
    const done = () => {
      if (live) setCompiled(true)
    }
    compileOffscreen(get, root).then(done, done)
    return () => {
      live = false
    }
  }, [get])

  useFrame(() => {
    if (!compiled) return
    frames.current += 1
    if (frames.current === 3) onDone(room)
  })

  return (
    <FurnishProvider clock={clock} count={pieces} reduced={false}>
      <group ref={group} visible={compiled}>
        <Layout armchair={armchair} />
      </group>
    </FurnishProvider>
  )
}

/** A room on stage: which, and its clock. Keyed, so a room shown twice mounts twice. */
type Slot = { key: number; room: RoomId; clock: RoomClock }

/**
 * The rooms on stage, and the handover from one to the next.
 *
 * THE INTRO
 *   The page opens on one room, which drops in piece by piece — the slow
 *   'drop' timing, half a second apart. Replay plays it again.
 *
 * A CHANGE OF ROOM
 *   Overlapped, not sequential, and done within ~0.9s of the click:
 *
 *     t = 0      every room on stage is sent away: its pieces drop out,
 *                sinking and shrinking into the floor, last in first out, in
 *                about 0.24s (0.36s for the living room's eleven)
 *     t = 0.12   the new room — mounted at the click, alongside — starts to
 *                arrive: pieces ~60ms apart, each easing into place
 *     t ≤ 0.9    its last piece is at rest
 *
 *   The shell never moves. A room is unmounted once its last piece is gone.
 *
 * INTERRUPTING
 *   Choose another room mid-change and whatever is on stage — the room going
 *   and the half-arrived one coming — is sent away from where it is, and the
 *   new choice starts its own arrival. A click never waits for an animation.
 *
 * FIRST VISITS ARE PREPARED IN THE BACKGROUND
 *   A room mounted for the first time compiles its shaders before it can be
 *   drawn — up to a second for the bedroom — which would blow the 0.9s. So
 *   once the page has settled, the rooms not yet shown are prepared one at a
 *   time out of sight (<WarmUp>), and a first visit is as quick as a return.
 *   If a room is asked for before it has been prepared, it still arrives:
 *   <Arrival> holds it until its shaders are ready, so it is late, not
 *   broken.
 *
 * Under reduced motion a change is a cut, and every room mounts finished.
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
  const [slots, setSlots] = useState<Slot[]>(() => [{ key: 0, room, clock: new RoomClock(INTRO) }])
  const nextKey = useRef(1)
  /** The room last acted on — a change of `room` is picked up in the loop. */
  const handled = useRef(room)

  /** Rooms prepared, or shown, already. */
  const [warmed, setWarmed] = useState<ReadonlySet<RoomId>>(() => new Set([room]))
  /** True while one room is on stage, at rest, and has been for a moment — when preparing is safe. */
  const [idle, setIdle] = useState(false)
  const idleSince = useRef(Number.POSITIVE_INFINITY)

  useFrame(() => {
    const now = STAGE.now

    // A new room asked for: send away everything on stage, bring it on.
    if (room !== handled.current) {
      handled.current = room
      idleSince.current = Number.POSITIVE_INFINITY
      if (idle) setIdle(false)
      if (reduced) {
        // A cut — but not to an empty room: the new room is mounted alongside,
        // and the old one is only taken away once the new one is drawn (below).
        const incoming: Slot = { key: nextKey.current++, room, clock: new RoomClock(INTRO) }
        setSlots((current) => [...current, incoming])
      } else {
        for (const slot of slots) slot.clock.sendAway(now)
        const incoming: Slot = {
          key: nextKey.current++,
          room,
          clock: new RoomClock(switchTiming(ROOMS[room].pieces), now + ENTER_DELAY),
        }
        setSlots((current) => [...current, incoming])
      }
      hotspots.publish(room, 0)
      return
    }

    const newest = slots[slots.length - 1]

    // Rooms whose last piece has gone come off stage. Under reduced motion,
    // everything but the newest goes the moment the newest is drawn: the cut.
    if (reduced && slots.length > 1 && newest.clock.ready) {
      setSlots([newest])
    } else if (slots.some((s) => s.clock.gone(now, ROOMS[s.room].pieces))) {
      setSlots((current) => current.filter((s) => !s.clock.gone(now, ROOMS[s.room].pieces)))
    }

    // The newest room's hotspots: live once it is drawn and at rest, fading
    // in over a third of a second; gone the instant it starts to leave.
    const arrived = newest.room === room && newest.clock.arrived(now, ROOMS[newest.room].pieces, reduced)
    hotspots.publish(newest.room, arrived ? Math.min(1, hotspots.alpha + STAGE.step / 0.35) : 0)

    // Idle — one room, at rest, for a second — is when rooms are prepared.
    const settled = arrived && slots.length === 1
    if (!settled) idleSince.current = Number.POSITIVE_INFINITY
    else if (idleSince.current === Number.POSITIVE_INFINITY) idleSince.current = now
    const nowIdle = settled && now - idleSince.current > 1
    if (nowIdle !== idle) setIdle(nowIdle)
  })

  // Replay the newest room's intro. Handled once per click, not on every
  // change of what is on stage.
  const handledToken = useRef(replayToken)
  useEffect(() => {
    if (replayToken === handledToken.current) return
    handledToken.current = replayToken
    const newest = slots[slots.length - 1]
    if (newest.clock.leaving) return
    newest.clock.replay(STAGE.now)
    // Replay plays the whole opening, the camera move with it.
    if (!reduced) restartIntro(STAGE.now + 0.15)
  }, [replayToken, slots, reduced])

  const onWarmed = useCallback((done: RoomId) => setWarmed((current) => new Set(current).add(done)), [])
  // Prepared under reduced motion too: it moves nothing, and a cut to a room
  // whose shaders are not ready is a cut that waits.
  const toWarm = ROOM_IDS.find((id) => !warmed.has(id) && id !== room)

  return (
    <>
      {slots.map(({ key, room: id, clock }) => (
        // Each slot its own boundary: a room whose models are still loading
        // suspends only itself — the shell, the lights and a leaving room
        // stay up.
        <Suspense key={key} fallback={null}>
          <FurnishProvider clock={clock} count={ROOMS[id].pieces} reduced={reduced}>
            <Arrival clock={clock} lead={key === 0 ? LEAD_IN : 0} reduced={reduced}>
              {(() => {
                const { Layout } = ROOMS[id]
                return <Layout armchair={armchair} />
              })()}
            </Arrival>
          </FurnishProvider>
        </Suspense>
      ))}

      {idle && toWarm && (
        <Suspense fallback={null}>
          <WarmUp key={toWarm} room={toWarm} armchair={armchair} onDone={onWarmed} />
        </Suspense>
      )}
    </>
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

/** Seconds a change of fabric, wall or floor takes to fade in. */
const FINISH_FADE = 0.4

/**
 * One faded set of numbers — a colour and its sheen, or the floor's grade.
 * Retargeting fades from wherever the values ARE, not from the last target,
 * so choosing again mid-fade simply bends the fade towards the new choice.
 */
class Fade {
  from: number[]
  to: number[]
  t0 = Number.NEGATIVE_INFINITY

  constructor(values: number[]) {
    this.from = [...values]
    this.to = [...values]
  }

  at(now: number) {
    const k = Math.min(Math.max((now - this.t0) / FINISH_FADE, 0), 1)
    const e = k * k * (3 - 2 * k)
    return this.from.map((f, i) => f + (this.to[i] - f) * e)
  }

  retarget(values: number[], now: number) {
    if (values.every((v, i) => v === this.to[i])) return
    this.from = this.at(now)
    this.to = [...values]
    this.t0 = now
  }
}

/** A colour's linear rgb — three stores colours linear, so fades pass through real greys. */
const rgb = (hex: string) => new Color(hex).toArray()

const UPHOLSTERY = {
  living: M.upholsteryLiving,
  kitchen: M.upholsteryKitchen,
  bedroom: M.upholsteryBedroom,
  office: M.upholsteryOffice,
} as const

/**
 * The material and colour switcher's effect on the scene: fades each room's
 * upholstery, the wall paint and the floor's grade to the chosen finishes
 * over FINISH_FADE, in the render loop — no remount, no reload. The first
 * finishes are applied at once: there is nothing to fade from.
 */
function FinishFades({ finishes }: { finishes: Finishes }) {
  const fades = useRef<Map<string, Fade> | null>(null)

  const values = (f: Finishes) => {
    const out = new Map<string, number[]>()
    for (const id of ROOM_IDS) {
      const fabric = FABRICS.find((o) => o.id === f.fabric[id]) ?? FABRICS[0]
      out.set(`fabric:${id}`, [...rgb(fabric.color), ...rgb(fabric.sheen)])
    }
    out.set('wall', rgb((WALLS.find((o) => o.id === f.wall) ?? WALLS[0]).color))
    const floor = FLOORS.find((o) => o.id === f.floor) ?? FLOORS[0]
    out.set('floor', [...floor.mul.toArray(), ...floor.add.toArray(), floor.sat])
    return out
  }

  useLayoutEffect(() => {
    const now = STAGE.now
    const next = values(finishes)
    if (!fades.current) {
      fades.current = new Map([...next].map(([key, v]) => [key, new Fade(v)]))
      return
    }
    for (const [key, v] of next) fades.current.get(key)?.retarget(v, now)
  }, [finishes])

  useFrame(() => {
    const all = fades.current
    if (!all) return
    const now = STAGE.now
    for (const id of ROOM_IDS) {
      const v = all.get(`fabric:${id}`)?.at(now)
      if (!v) continue
      UPHOLSTERY[id].color.setRGB(v[0], v[1], v[2])
      UPHOLSTERY[id].sheenColor.setRGB(v[3], v[4], v[5])
    }
    const wall = all.get('wall')?.at(now)
    if (wall) M.wall.color.setRGB(wall[0], wall[1], wall[2])
    const floor = all.get('floor')?.at(now)
    if (floor) {
      FLOOR_GRADE.uFloorMul.value.set(floor[0], floor[1], floor[2])
      FLOOR_GRADE.uFloorAdd.value.set(floor[3], floor[4], floor[5])
      FLOOR_GRADE.uFloorSat.value = floor[6]
    }
  })

  return null
}

/**
 * The scroll camera: pushes the camera into the room along its own line of
 * sight as the hero scrolls away (RIG.scroll, from useScrollCamera), and back
 * out as it returns. Only the distance changes — whatever angle the visitor
 * has turned the room to is kept.
 *
 * Eased towards the scroll rather than locked to it, so a flick of the wheel
 * becomes a glide rather than a jump. Runs after OrbitControls (priority -1)
 * has placed the camera for this frame, and OrbitControls reads its distance
 * back from where this leaves it, so the two never fight.
 */
function ScrollDolly({ reduced }: { reduced: boolean }) {
  const eased = useRef(0)
  const offset = useMemo(() => new Vector3(), [])

  useFrame(({ camera }, delta) => {
    const target = RIG.scroll
    eased.current += (target - eased.current) * (1 - Math.exp(-delta * 7))
    if (Math.abs(target - eased.current) < 1e-4) eased.current = target
    const k = eased.current * eased.current * (3 - 2 * eased.current)

    offset.copy(camera.position).sub(TARGET)
    const want = RIG.baseDistance * (1 - SCROLL_PUSH * k) * (reduced ? 1 : introPull(STAGE.now))
    if (Math.abs(offset.length() - want) < 1e-4) return
    camera.position.copy(TARGET).addScaledVector(offset.normalize(), want)
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
  finishes,
  timeOfDay,
  copyRect,
  active,
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
  /** Every room's fabric, and the wall and floor, chosen with the switcher. */
  finishes: Finishes
  /** Day or evening — see lighting.ts. */
  timeOfDay: TimeOfDay
  /** Where the copy block sits over the canvas, on the desktop layout — see framing-fit.ts. */
  copyRect: Rect | null
  /** False while the tab is hidden or the stage is off screen: nothing is drawn. */
  active: boolean
}) {
  // Phones start on the cheaper settings; PerformanceMonitor drops anything
  // else that turns out to struggle. It never climbs back up — flickering
  // between the two is worse than staying on the cheaper one.
  const [quality, setQuality] = useState<Quality>(coarsePointer ? 'low' : 'high')

  // A fresh scene opens with the camera move again — camera-rig.ts.
  useLayoutEffect(clearIntro, [])

  return (
    <Canvas
      // Not drawn at all while the tab is hidden or the room is scrolled away
      // — see use-render-active.ts.
      frameloop={active ? 'always' : 'never'}
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

      {/* First in every frame: the one timeline the whole stage is timed on. */}
      <StageClock />

      <PerformanceMonitor onDecline={() => setQuality('low')} />

      {/*
       * The shell suspends on its floor texture, so the room is never seen
       * with a flat floor that then changes. The furnishings have their own
       * boundary inside <Rooms>: a glTF model still loading suspends only
       * the room it belongs to.
       */}
      <LampLights>
        <Suspense fallback={null}>
          <Studio quality={quality} timeOfDay={timeOfDay} reduced={reduced} />
          <Room />
          {/* Dust in the light — not on phones, not on the cheaper setting. */}
          {!coarsePointer && quality === 'high' && <Dust />}
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

      <Framing layout={layout} copyRect={copyRect} reduced={reduced} />
      <ScrollDolly reduced={reduced} />
      <HotspotProjector store={hotspots} />
      <FinishFades finishes={finishes} />
      {coarsePointer && <TouchScroll />}

      <Effects quality={quality} />
    </Canvas>
  )
}
