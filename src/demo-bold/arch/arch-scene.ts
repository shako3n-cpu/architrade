import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Texture,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { ARCH, CAMERA, FLOOR_Y, GLASS_Z, REST_YAW, archOutline, openingOutline } from './arch-shape'

/**
 * ============================================================================
 * THE HERO ARCH — the only 3D on the page
 * ----------------------------------------------------------------------------
 * A brushed-bronze arch holding a pane of reeded amber glass, floating over a
 * pool of its own light. It breathes (a slow rise and fall), swings a little
 * either side of its resting angle, and leans toward a mouse.
 *
 * NOTHING HERE WAITS ON A DOWNLOAD
 *   Every surface is procedural — the reeds, the glow, the studio reflected
 *   in the bronze — so the first frame this module renders is the finished
 *   arch. This project once shipped a hero whose floor texture held a whole
 *   scene blank behind a Suspense boundary for most of a minute on a real
 *   connection; nothing in this file can do that. Keep it so: anything
 *   fetched later is attached when it lands, never waited for.
 *
 * Plain three.js, not react-three-fiber: fiber's JSX types widen React's
 * intrinsic elements across the whole program and break the site's own
 * <Container as>, which this demo may not edit.
 *
 * Its own chunk, fetched after the page has painted (hero-stage.tsx). Until
 * it arrives — and for good, if it never does — arch-drawing.tsx stands in.
 * ============================================================================
 */

export interface ArchOptions {
  /** Reduced motion: one still frame at the resting pose. */
  still: boolean
  /** The first frame is on screen. */
  onReady: () => void
  /** The GPU took the context away; the page should show the drawing again. */
  onLost: () => void
}

export interface ArchHandle {
  setActive: (active: boolean) => void
  dispose: () => void
}

export function mountArch(host: HTMLElement, { still, onReady, onLost }: ArchOptions): ArchHandle {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' })
  // Reading back every program's log costs a round trip per shader, and on
  // Windows the driver fills it with harmless precision notes that three
  // prints as warnings. Worth it while developing; not in production.
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  const canvas = renderer.domElement
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  host.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 40)
  camera.position.set(...CAMERA.position)
  const target = new Vector3(...CAMERA.target)
  camera.lookAt(target)

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends Material | BufferGeometry | Texture>(thing: T) => {
    disposables.push(thing)
    return thing
  }

  /*
   * The light, richer than a product shot's: a studio made in code for the
   * bronze to reflect, a warm key from the upper left, an amber rim from
   * behind that draws the arch's edges out of the dark page, and a glow
   * inside the opening that lights the inner faces of the band.
   */
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = keep(pmrem.fromScene(new RoomEnvironment(), 0.04).texture)
  scene.environmentIntensity = 0.42
  pmrem.dispose()
  const key = new DirectionalLight('#ffe2bd', 0.9)
  key.position.set(-3, 4, 5)
  const rim = new DirectionalLight('#ffab4a', 3.2)
  rim.position.set(3, 2.5, -3.5)
  scene.add(key, rim)

  /* ---- The arch -------------------------------------------------------- */

  const arch = new Group()
  arch.rotation.y = REST_YAW
  scene.add(arch)
  // The glass's light on the inside of the band: it turns with the arch, and
  // sits behind the pane so the clear coat shows no glint of it.
  const glow = new PointLight('#ffb561', 2.2, 2.4, 2)
  glow.position.set(0, -0.05, -0.12)
  arch.add(glow)

  const bevel = 0.03
  const band = keep(
    new ExtrudeGeometry(toShape(archOutline(64)), {
      depth: ARCH.depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 5,
      curveSegments: 64,
    }),
  )
  band.translate(0, 0, -(ARCH.depth - bevel * 2) / 2)
  const bronze = keep(
    new MeshPhysicalMaterial({
      color: '#a8743f',
      metalness: 1,
      roughness: 0.3,
      // Brushed along the band: highlights stretch into streaks, which is
      // what separates bronze from a gold-painted prop.
      anisotropy: 0.55,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    }),
  )
  arch.add(new Mesh(band, bronze))

  const pane = keep(new ShapeGeometry(toShape(openingOutline(64)), 64))
  normaliseUVs(pane)
  pane.translate(0, 0, GLASS_Z)
  const reeds = keep(reededNormals())
  reeds.repeat.set(16, 1)
  const glass = keep(
    new MeshPhysicalMaterial({
      color: '#2a1a0c',
      emissive: '#ffffff',
      emissiveMap: keep(amberLight()),
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      clearcoatNormalMap: reeds,
      clearcoatNormalScale: new Vector2(0.9, 0.9),
      transparent: true,
      opacity: 0.92,
    }),
  )
  arch.add(new Mesh(pane, glass))

  // The floor pool: an additive ellipse of amber under the arch, brighter as
  // the arch sinks toward it and fainter as it rises.
  const pool = keep(
    new MeshBasicMaterial({ map: keep(radialSpot()), color: '#f0b865', transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false }),
  )
  const floor = new Mesh(keep(new PlaneGeometry(2.4, 2.4)), pool)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  floor.scale.set(1, 0.42, 1)
  scene.add(floor)

  /* ---- Motion --------------------------------------------------------- */

  const pointer = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }
  if (!still) window.addEventListener('pointermove', onPointer, { passive: true })

  const lean = { yaw: 0, pitch: 0 }
  let born = 0
  let last = 0

  /*
   * All measured from the first frame, so every motion starts at the resting
   * pose the drawing shows and eases in over the first seconds.
   *
   *   breath  a rise and fall of 6cm over 6.5s, the glass brightening a
   *           touch at the top of it
   *   swing   ±20° either side of the resting angle, over 18s
   *   lean    toward a mouse, damped, a few degrees
   */
  function move(now: number) {
    if (!born) born = now
    const age = now - born
    const dt = last ? Math.min(now - last, 0.1) : 0.016
    last = now
    const ease = Math.min(1, age / 3.5) ** 2

    const breath = Math.sin((age * 2 * Math.PI) / 6.5)
    arch.position.y = ease * 0.06 * breath
    glass.emissiveIntensity = 0.85 + ease * 0.1 * breath
    const sink = 1 - ease * 0.06 * breath
    floor.scale.set(sink, 0.42 * sink, 1)
    pool.opacity = 0.55 * sink

    const k = 1 - Math.exp(-dt * 2.4)
    lean.yaw += (pointer.x * 0.22 - lean.yaw) * k
    lean.pitch += (pointer.y * 0.08 - lean.pitch) * k
    arch.rotation.y = REST_YAW + ease * 0.35 * Math.sin((age * 2 * Math.PI) / 18) + lean.yaw
    arch.rotation.x = lean.pitch
  }

  const render = () => renderer.render(scene, camera)
  const tick = (time: number) => {
    move(time / 1000)
    render()
  }

  /* ---- Size ------------------------------------------------------------ */

  let running = false
  let wantActive = true
  let ready = false
  let disposed = false

  const fitToHost = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // A stopped or still arch is redrawn at its new size by hand — once it
    // has compiled; drawing before that would compile on the main thread.
    if (ready && !running) render()
  }
  const sizes = new ResizeObserver(fitToHost)

  const setRunning = (run: boolean) => {
    run = run && !still && ready && !disposed
    if (run === running) return
    running = run
    // Coming back from a stop should not count the gap as one long frame.
    if (run) last = 0
    renderer.setAnimationLoop(run ? tick : null)
  }

  const onContextLost = (event: Event) => {
    event.preventDefault()
    setRunning(false)
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)

  /*
   * Shaders compile off the main thread where the browser allows it, so the
   * hero's text keeps animating while the GPU gets ready; then one frame is
   * drawn, and the page is told once that frame has been presented.
   */
  fitToHost()
  renderer
    .compileAsync(scene, camera)
    .catch(() => undefined)
    .then(() => {
      if (disposed) return
      render()
      sizes.observe(host)
      requestAnimationFrame(() => {
        if (disposed) return
        ready = true
        onReady()
        setRunning(wantActive)
      })
    })

  return {
    setActive(active) {
      wantActive = active
      setRunning(active)
    },
    dispose() {
      disposed = true
      setRunning(false)
      renderer.setAnimationLoop(null)
      sizes.disconnect()
      window.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      for (const thing of disposables) thing.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}

/* ---- Procedural surfaces -------------------------------------------------- */

function toShape(points: readonly (readonly [number, number])[]): Shape {
  return new Shape(points.map(([x, y]) => new Vector2(x, y)))
}

/** ShapeGeometry's UVs are raw coordinates; the glass's maps want 0..1. */
function normaliseUVs(geometry: BufferGeometry) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - box.min.x) / (box.max.x - box.min.x), (position.getY(i) - box.min.y) / (box.max.y - box.min.y))
  }
  uv.needsUpdate = true
}

/**
 * The light in the glass: warm at the top, deep amber at the foot — the
 * colour of a low sun through a reeded pane — with the reeds themselves in
 * it as a faint rise and fall of brightness across the pane. The clear coat
 * alone only showed them where it caught a reflection, which under this
 * lighting was hardly anywhere; the flat drawing showed them everywhere.
 */
function amberLight(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  const gradient = context.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, '#f2c27a')
  gradient.addColorStop(0.45, '#d98a36')
  gradient.addColorStop(1, '#4e2b12')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  // Sixteen reeds, matching the clear coat's normal map.
  const reed = 256 / 16
  for (let x = 0; x < 256; x++) {
    const phase = ((x % reed) + 0.5) / reed
    const light = Math.cos(phase * Math.PI * 2)
    context.fillStyle = light > 0 ? `rgba(255,236,200,${(light * 0.16).toFixed(3)})` : `rgba(40,20,5,${(-light * 0.22).toFixed(3)})`
    context.fillRect(x, 0, 1, 256)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Reeded glass: one convex flute as a normal map, repeated across the pane.
 * The clear coat reflects the studio through it, so the highlights break
 * into vertical bands the way fluted glass does.
 */
function reededNormals(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 2
  const context = canvas.getContext('2d')!
  for (let x = 0; x < canvas.width; x++) {
    const slope = Math.sin(((x + 0.5) / canvas.width) * Math.PI * 2) * 0.75
    const nz = Math.sqrt(1 - slope * slope)
    context.fillStyle = `rgb(${Math.round((slope * 0.5 + 0.5) * 255)},128,${Math.round((nz * 0.5 + 0.5) * 255)})`
    context.fillRect(x, 0, 1, canvas.height)
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  return texture
}

/** A soft round spot, bright in the middle and gone at the edge. */
function radialSpot(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
