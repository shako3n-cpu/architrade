import {
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Texture,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CAMERA, COLLAR, CORD, DIFFUSER, SHADE, SHADE_PROFILE } from './lamp-shape'

/**
 * ============================================================================
 * THE HERO LAMP — the only 3D on the page
 * ----------------------------------------------------------------------------
 * A spun-brass dome pendant, built from a lathe profile and lit by a studio
 * environment that three.js generates in code. There is not one asset file
 * behind it — no model, no texture, no HDR — which is the point: nothing in
 * here can be slow to arrive, so nothing in here can hold the first frame.
 *
 * NOTHING HERE WAITS ON A DOWNLOAD
 *   This project once shipped a hero whose floor texture loaded through a
 *   Suspense boundary that held every object in the scene until that one
 *   JPEG landed — on a real connection, a blank hero for most of a minute.
 *   The first frame this module renders is the finished lamp. Keep it that
 *   way: if a texture is ever added, attach it when it lands, and render
 *   without it until then.
 *
 * PLAIN three.js, NOT react-three-fiber
 *   One object and one camera need no scene graph in React, and fiber's JSX
 *   types widen React's intrinsic elements for the whole program — which
 *   breaks the site's own <Container as>. Imperative, it is also smaller.
 *
 * This file is its own chunk, fetched after the page has painted (see
 * hero-stage.tsx). Until it arrives — and for good, if it never does — the
 * flat drawing in lamp-drawing.tsx stands in.
 * ============================================================================
 */

export interface LampOptions {
  /** Reduced motion: one still frame, no sway, no parallax. */
  still: boolean
  /** The first frame is on screen. */
  onReady: () => void
  /** The GPU took the context away; the page should show the drawing again. */
  onLost: () => void
}

export interface LampHandle {
  /** Keep rendering (on screen, tab visible) or pause. */
  setActive: (active: boolean) => void
  dispose: () => void
}

export function mountLamp(host: HTMLElement, { still, onReady, onLost }: LampOptions): LampHandle {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' })
  // Reading back every program's log costs a GPU round trip per shader, and on
  // Windows the driver fills it with harmless precision notes that three then
  // prints as warnings. Worth it while developing; not in production.
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  // Neutral keeps the brass the colour it was given; ACES pushes it toward
  // orange and crushes the inside of the shade.
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  host.appendChild(renderer.domElement)

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
   * The light: a studio room made in code and pre-filtered for reflection,
   * one warm key from the upper left, and the bulb lighting the inside of
   * the dome. A polished metal is only as good as what it reflects.
   */
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = keep(pmrem.fromScene(new RoomEnvironment(), 0.035).texture)
  scene.environmentIntensity = 0.95
  pmrem.dispose()
  const key = new DirectionalLight('#fff1dc', 1.1)
  key.position.set(-3.5, 4, 5)
  const bulb = new PointLight('#ffcf92', 3.2, 1.6, 2)
  bulb.position.set(0, DIFFUSER.y + 0.12, 0)
  scene.add(key, bulb)

  const lamp = buildPendant(keep)
  // Hung from the top of its cord, so the sway is a pendulum's.
  const swing = new Group()
  swing.position.y = CORD.top
  lamp.position.y = -CORD.top
  swing.add(lamp)
  scene.add(swing)

  /* ---- Motion ----------------------------------------------------------- */

  const pointer = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }
  if (!still) window.addEventListener('pointermove', onPointer, { passive: true })

  const offset = camera.position.clone().sub(target)
  const orbit = { radius: offset.length(), yaw: Math.atan2(offset.x, offset.z), pitch: Math.asin(offset.y / offset.length()) }
  const eased = { yaw: 0, pitch: 0 }
  let born = 0
  let last = 0

  /*
   * Measured on the page's own clock from the first frame, so both motions
   * start from the drawing's pose and ease in from rest.
   *
   *   sway   a pendulum at the period a 9m cord really has (2π√(L/g) ≈ 6s),
   *          a fraction of a degree either way
   *   orbit  the camera wanders slowly round the lamp and leans toward a
   *          mouse. Moving the camera moves the reflections across the
   *          brass — a symmetrical dome turning on its axis would look still.
   */
  function move(now: number) {
    if (!born) born = now
    const age = now - born
    const dt = last ? Math.min(now - last, 0.1) : 0.016
    last = now

    const ease = Math.min(1, age / 4) ** 2
    const w = (2 * Math.PI) / 6
    swing.rotation.z = ease * 0.0055 * Math.sin(w * age)
    swing.rotation.x = ease * 0.0035 * Math.sin(w * 0.83 * age + 1.2)

    const k = 1 - Math.exp(-dt * 2.2)
    eased.yaw += (0.16 * Math.sin(age * 0.11) + pointer.x * 0.28 - eased.yaw) * k
    eased.pitch += (-pointer.y * 0.05 - eased.pitch) * k
    const yaw = orbit.yaw + eased.yaw
    const pitch = orbit.pitch + eased.pitch
    camera.position.set(
      target.x + orbit.radius * Math.cos(pitch) * Math.sin(yaw),
      target.y + orbit.radius * Math.sin(pitch),
      target.z + orbit.radius * Math.cos(pitch) * Math.cos(yaw),
    )
    camera.lookAt(target)
  }

  const render = () => renderer.render(scene, camera)
  const tick = (time: number) => {
    move(time / 1000)
    render()
  }

  /* ---- Size ------------------------------------------------------------- */

  const fitToHost = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // A stopped or still lamp is redrawn at its new size by hand — once it has
    // compiled; drawing before that would compile on the main thread.
    if (ready && !running) render()
  }
  const sizes = new ResizeObserver(fitToHost)

  /* ---- Running, pausing, and the first frame ----------------------------- */

  let running = false
  let wantActive = true
  let ready = false
  let disposed = false

  const setRunning = (run: boolean) => {
    run = run && !still && ready && !disposed
    if (run === running) return
    running = run
    // A stopped canvas that starts again should not treat the gap as one long frame.
    if (run) last = 0
    renderer.setAnimationLoop(run ? tick : null)
  }

  const onContextLost = (event: Event) => {
    event.preventDefault()
    setRunning(false)
    onLost()
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost)

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
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      for (const thing of disposables) thing.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

/* ---- The pendant ---------------------------------------------------------- */

function buildPendant(keep: <T extends Material | BufferGeometry | Texture>(thing: T) => T): Group {
  const brass = keep(
    new MeshStandardMaterial({
      // A PBR metal's colour is its reflectance, which for brass is well above
      // the muted swatch the page uses — that value would render as bronze.
      color: '#d0a86f',
      metalness: 1,
      roughness: 0.42,
      roughnessMap: keep(spinRings()),
      side: DoubleSide,
    }),
  )
  const inside = keep(
    new MeshStandardMaterial({ color: '#efe2cd', roughness: 0.85, emissive: '#ffcf93', emissiveIntensity: 0.12, side: DoubleSide }),
  )
  const opal = keep(new MeshStandardMaterial({ color: '#fff8ec', emissive: '#ffe2b8', emissiveIntensity: 3.2, roughness: 0.35 }))
  const flex = keep(new MeshStandardMaterial({ color: '#1d1e20', roughness: 0.85 }))

  const outer = keep(new LatheGeometry(SHADE_PROFILE.map(([r, y]) => new Vector2(r, y)).reverse(), 96))
  const inner = keep(
    new LatheGeometry(
      SHADE_PROFILE.map(([r, y]) => new Vector2(Math.max(r - SHADE.thickness, 0.01), y - SHADE.thickness * 0.6)).reverse(),
      96,
    ),
  )
  // The rolled lip: the one line of light that says the sheet has a thickness.
  const lip = keep(new TorusGeometry(SHADE.radius - SHADE.thickness / 2, SHADE.thickness / 2, 10, 128))
  const collar = keep(new CylinderGeometry(COLLAR.radius, COLLAR.radius, COLLAR.top - COLLAR.bottom, 40))
  const cord = keep(new CylinderGeometry(CORD.radius, CORD.radius, CORD.top - COLLAR.top, 10))
  const diffuser = keep(new SphereGeometry(DIFFUSER.radius, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2))

  const group = new Group()
  const lipMesh = new Mesh(lip, brass)
  lipMesh.rotation.x = Math.PI / 2
  const collarMesh = new Mesh(collar, brass)
  collarMesh.position.y = (COLLAR.bottom + COLLAR.top) / 2
  const cordMesh = new Mesh(cord, flex)
  cordMesh.position.y = (COLLAR.top + CORD.top) / 2
  const diffuserMesh = new Mesh(diffuser, opal)
  diffuserMesh.position.y = DIFFUSER.y
  group.add(new Mesh(outer, brass), new Mesh(inner, inside), lipMesh, collarMesh, cordMesh, diffuserMesh)
  return group
}

/**
 * Spun metal carries rings from the lathe: fine concentric bands where the
 * surface is a touch more or less polished. A narrow canvas of random bands,
 * used as a roughness map along the profile, draws them — which is what makes
 * the reflections read as metal rather than as paint.
 */
function spinRings(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const context = canvas.getContext('2d')!
  for (let y = 0; y < canvas.height; y++) {
    const v = 150 + Math.round((Math.random() - 0.5) * 70)
    context.fillStyle = `rgb(${v},${v},${v})`
    context.fillRect(0, y, canvas.width, 1)
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  return texture
}
