import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  Box3,
  CanvasTexture,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  Vector3,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
} from 'three'
import { useLampGlow } from './lamp-glow'
import { M } from './materials'
import { PALETTE } from './palette'

/**
 * ============================================================================
 * THE POLY HAVEN MODELS
 * ----------------------------------------------------------------------------
 * CC0 models from polyhaven.com, 1k textures, stored under ./models and
 * loaded from there — never from a CDN:
 *
 *   modern_arm_chair_01     living room   the armchair
 *   modern_ceiling_lamp_01  kitchen       the two pendants over the island
 *   side_table_01           bedroom       the bedside table
 *   modern_wooden_cabinet   bedroom       the long low sideboard
 *   drawer_cabinet          office        the shelving unit with drawers
 *
 * The rule for every room is the one the living room settled: a Poly Haven
 * model where Poly Haven has a MODERN piece that fits, modelled here
 * otherwise. Most of its catalogue is vintage, rustic or gothic, which is why
 * the sofa, the bed, the desk, the kitchen and the stools are all procedural.
 *
 * WHY THERE IS NO POLY HAVEN SOFA
 *   sofa_02 was downloaded alongside the armchair and then deleted. It turned
 *   out to be a traditional tufted Chesterfield on carved feet — and every
 *   sofa Poly Haven has (Sofa_01, sofa_02, sofa_03, painted_wooden_sofa) is a
 *   traditional style, so no swap exists for the modern minimal brief.
 *
 * WHY THE FILES LIVE IN src/dev AND NOT IN public/
 *   Everything in public/ is copied into every production build. These are
 *   only fetched by the dev-only route, through `new URL(..., import.meta.url)`
 *   in a module the production build never includes, so they never reach
 *   dist/.
 *
 * INTO THE PALETTE: TWO WAYS
 *   Every model arrives in its photographed colours — walnut, oak, black
 *   steel, orange — and is re-dressed in graphite, off-white and brass.
 *
 *   By MATERIAL, where the model gives each part its own (the armchair, the
 *   pendant): the part gets a palette colour, and keeps the model's normal
 *   and roughness maps, which carry the grain and the creases.
 *
 *   By RAMP, where it does not. The side table, the sideboard and the shelving
 *   unit each have ONE material and ONE texture atlas for every part — the
 *   same thing that sank sofa_02. Here it can be got round: in those three,
 *   the parts that should differ also differ in BRIGHTNESS (black steel
 *   against oak; walnut against pale cane), so the colour map is re-drawn
 *   through a ramp — dark photographed values to graphite, light ones to
 *   off-white or sand — and the grain survives as variation within each tone.
 *
 * Draco and Meshopt are both OFF. None of these models uses either — checked
 * in each file's extensionsUsed — and drei's Draco default would point a
 * decoder at gstatic.com. Nothing here is allowed to reach a CDN.
 * ============================================================================
 */

const NO_DRACO = false
const NO_MESHOPT = false

const model = (id: string) => new URL(`./models/${id}/${id}_1k.gltf`, import.meta.url).href

const URLS = {
  armchair: model('modern_arm_chair_01'),
  pendant: model('modern_ceiling_lamp_01'),
  sideTable: model('side_table_01'),
  sideboard: model('modern_wooden_cabinet'),
  shelving: model('drawer_cabinet'),
}

/* -------------------------------------------------------------------------- */
/* Loading and normalising                                                    */
/* -------------------------------------------------------------------------- */

type Anchor = 'floor' | 'ceiling'

/**
 * A model, cloned, re-dressed, and normalised to the procedural pieces'
 * conventions: origin at the centre of its footprint, front facing +Z (as
 * modelled), and either standing on y = 0 ('floor') or hanging from it
 * ('ceiling', for a pendant: the origin is where it meets the ceiling).
 *
 * Every mesh casts and receives shadow — set here rather than by DropIn,
 * because DropIn marks its children when it mounts, and a model that arrives
 * through Suspense is not there yet.
 */
function usePolyHavenModel(url: string, dress: ((mesh: Mesh) => void) | null, anchor: Anchor = 'floor') {
  const { scene } = useGLTF(url, NO_DRACO, NO_MESHOPT)

  const clone = useMemo(() => {
    // A clone, so the cached original keeps its own materials: switching looks
    // needs no reload, and two instances can be dressed independently.
    const root = scene.clone(true)

    root.traverse((object: Object3D) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      dress?.(mesh)
    })

    root.updateMatrixWorld(true)
    const box = new Box3().setFromObject(root)
    const centre = box.getCenter(new Vector3())
    root.position.set(-centre.x, anchor === 'floor' ? -box.min.y : -box.max.y, -centre.z)
    return root
  }, [scene, dress, anchor])

  // The materials dress() made belong to this instance; the loader's own stay
  // cached with the model, and the shared ones in materials.ts belong to
  // everything. Without this, every change of room would leave a set of
  // materials behind in the renderer.
  useEffect(
    () => () => {
      const keep = new Set<Material>(Object.values(M))
      scene.traverse((object) => {
        const material = (object as Mesh).material
        if (material) for (const m of [material].flat()) keep.add(m)
      })
      clone.traverse((object) => {
        const material = (object as Mesh).material
        if (material) for (const m of [material].flat()) if (!keep.has(m)) m.dispose()
      })
    },
    [scene, clone],
  )

  return clone
}

/* -------------------------------------------------------------------------- */
/* Re-dressing                                                                */
/* -------------------------------------------------------------------------- */

/** A photographed surface's detail — normal, roughness, AO — with a new colour. */
function keepDetail(source: MeshStandardMaterial) {
  return {
    roughness: 1,
    // The packed ARM map's green channel is roughness; three reads it there.
    roughnessMap: source.roughnessMap,
    normalMap: source.normalMap,
    normalScale: source.normalScale.clone(),
    aoMap: source.aoMap,
    metalness: 0,
  }
}

/** Upholstery: the palette's off-white, with the procedural fabric's sheen. */
function brandFabric(source: MeshStandardMaterial): Material {
  return new MeshPhysicalMaterial({
    ...keepDetail(source),
    color: PALETTE.fabricLight,
    sheen: 1,
    sheenRoughness: 0.8,
    sheenColor: '#ffffff',
  })
}

/** Timber stained graphite: the grain stays in the detail maps, the colour goes. */
function brandWood(source: MeshStandardMaterial): Material {
  return new MeshPhysicalMaterial({
    ...keepDetail(source),
    color: PALETTE.graphite,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
  })
}

/** [photographed luminance 0..255, palette colour] — sorted by luminance. */
type Ramp = readonly (readonly [number, string])[]

const graded = new Map<string, Texture>()

/**
 * The colour map, re-drawn through a ramp: each pixel's brightness looks up a
 * palette colour. Done once per texture and ramp, on the CPU, when the model
 * is first dressed — a 1k map is a million pixels, a few milliseconds.
 */
function gradeMap(source: Texture, ramp: Ramp, key: string): Texture {
  const id = `${source.uuid}:${key}`
  const hit = graded.get(id)
  if (hit) return hit

  const lut = new Uint8ClampedArray(256 * 3)
  const rgb = ramp.map(([at, hex]) => {
    const n = parseInt(hex.slice(1), 16)
    return [at, (n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  })
  for (let l = 0; l < 256; l++) {
    let i = 0
    while (i < rgb.length - 2 && l > rgb[i + 1][0]) i++
    const [a0, r0, g0, b0] = rgb[i]
    const [a1, r1, g1, b1] = rgb[i + 1]
    const t = Math.min(Math.max((l - a0) / (a1 - a0), 0), 1)
    lut[l * 3] = r0 + (r1 - r0) * t
    lut[l * 3 + 1] = g0 + (g1 - g0) * t
    lut[l * 3 + 2] = b0 + (b1 - b0) * t
  }

  const image = source.image as ImageBitmap | HTMLImageElement
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0)
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = pixels.data
  for (let i = 0; i < d.length; i += 4) {
    const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) | 0
    d[i] = lut[l * 3]
    d[i + 1] = lut[l * 3 + 1]
    d[i + 2] = lut[l * 3 + 2]
  }
  ctx.putImageData(pixels, 0, 0)

  const texture = new CanvasTexture(canvas)
  // As the loader left the original: glTF textures are not flipped.
  texture.flipY = source.flipY
  texture.wrapS = source.wrapS
  texture.wrapT = source.wrapT
  texture.channel = source.channel
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  graded.set(id, texture)
  return texture
}

/** A single-atlas surface, re-coloured through a ramp, its detail maps kept. */
function rampDressed(source: MeshStandardMaterial, ramp: Ramp, key: string, extra: object = {}): Material {
  return new MeshPhysicalMaterial({
    ...keepDetail(source),
    map: source.map ? gradeMap(source.map, ramp, key) : null,
    color: '#ffffff',
    ...extra,
  })
}

/* -------------------------------------------------------------------------- */
/* Living room: the armchair                                                  */
/* -------------------------------------------------------------------------- */

export type ModelLook = 'brand' | 'raw'

/*
 * The model's "legs" material is its WHOLE timber frame — arms, back panel,
 * runners — not four legs. Brass there made a solid-brass chair: no longer an
 * accent, which is all brass is for in this palette. So the frame is stained
 * graphite and the cushions are off-white.
 */
function dressArmchair(mesh: Mesh) {
  const source = mesh.material as MeshStandardMaterial
  mesh.material = source.name.includes('legs') ? brandWood(source) : brandFabric(source)
}

/**
 * Poly Haven's "Modern Arm Chair 01" by Vibrant Nordic, 0.82 x 1.02 x 0.99 m.
 * The default armchair: compared against the procedural one, it won — a real
 * mid-century lounge chair, with a proper timber frame and the creases of
 * real cushions, where the procedural chair is rounded boxes.
 *
 *   'brand'  geometry and surface detail kept, colour replaced. The default.
 *   'raw'    exactly as downloaded — walnut and black leather — for reference.
 */
export function PolyHavenArmchair({ look }: { look: ModelLook }) {
  const root = usePolyHavenModel(URLS.armchair, look === 'brand' ? dressArmchair : null)
  return <primitive object={root} />
}

/* -------------------------------------------------------------------------- */
/* Kitchen: the pendant                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Poly Haven's "Modern Ceiling Lamp 01": a wide opal dome on a short rod,
 * 0.43m across. Three materials, so it is dressed by part: the dome stays an
 * off-white that glows faintly once the lamp is on, as opal glass does; the
 * canopy and rod become brass; the bulb becomes the lamp's own emissive bulb.
 *
 * Origin at the ceiling. It lights like every other lamp — see lamp-glow.ts.
 */
export function PendantLamp() {
  const { glow, anchor } = useLampGlow({ bulb: 7, skin: { make: opalDome, peak: 0.28 }, light: 1.6, distance: 4 })

  const dress = useMemo(
    () => (mesh: Mesh) => {
      // One mesh, three primitives — three loads them as three child meshes,
      // each with one of the three materials.
      const name = (mesh.material as Material).name
      mesh.material = name.endsWith('_glass') ? glow.skin! : name.includes('globe') ? glow.bulb : M.brass
    },
    [glow],
  )
  const root = usePolyHavenModel(URLS.pendant, dress, 'ceiling')

  return (
    <group>
      <primitive object={root} />
      {/* Just under the dome's rim, where the light leaves it. */}
      <group ref={anchor} position={[0, -0.95, 0]} />
    </group>
  )
}

/** The pendant's dome: opal glass, off-white, glowing faintly through once lit. */
const opalDome = () =>
  new MeshPhysicalMaterial({
    color: PALETTE.ceramic,
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    emissive: PALETTE.bulb,
    emissiveIntensity: 0,
  })

/* -------------------------------------------------------------------------- */
/* Bedroom: the bedside table and the sideboard                               */
/* -------------------------------------------------------------------------- */

/** Oak to graphite-stained oak: the whole range of the photograph kept inside two darks. */
const GRAPHITE_STAIN: Ramp = [
  [40, '#191a1d'],
  [130, '#2c2f33'],
  [215, '#474a50'],
]

const dressSideTable = (mesh: Mesh) => {
  mesh.material = rampDressed(mesh.material as MeshStandardMaterial, GRAPHITE_STAIN, 'stain', {
    clearcoat: 0.2,
    clearcoatRoughness: 0.45,
  })
}

/**
 * Poly Haven's "Side Table 01": a minimal oak table with a shelf, 0.55 x 0.45
 * x 0.55 m — the bedside table, stained graphite. Its top is at SIDE_TABLE_01_TOP.
 */
export function PolyHavenSideTable() {
  const root = usePolyHavenModel(URLS.sideTable, dressSideTable)
  return <primitive object={root} />
}

/** Height of the side table's top surface — the bedside lamp stands on it. */
export const SIDE_TABLE_01_TOP = 0.551

/** Height of its shelf's top surface — read off the model's vertices. */
export const SIDE_TABLE_01_SHELF = 0.35

/**
 * The sideboard's body: black legs and walnut, both to graphite, the walnut a
 * step lighter so the carcass still reads against its legs.
 */
const SIDEBOARD_BODY: Ramp = [
  [15, '#17181b'],
  [60, '#2a2c30'],
  [140, '#3d4045'],
]

/** Its doors: pale cane over a walnut frame. Cane to sand; the frame to graphite. */
const SIDEBOARD_DOORS: Ramp = [
  [30, '#2a2c30'],
  [75, '#6f685d'],
  [125, '#bdb3a3'],
  [200, '#ddd5c7'],
]

const dressSideboard = (mesh: Mesh) => {
  const source = mesh.material as MeshStandardMaterial
  mesh.material = mesh.name.includes('door')
    ? rampDressed(source, SIDEBOARD_DOORS, 'doors')
    : rampDressed(source, SIDEBOARD_BODY, 'body', { clearcoat: 0.2, clearcoatRoughness: 0.45 })
}

/**
 * Poly Haven's "Modern Wooden Cabinet": a long, low mid-century sideboard on
 * hairpin legs, 2.44 x 0.52 x 0.68 m, with two cane doors. Graphite, with the
 * cane in sand — the one textured surface in the bedroom.
 */
export function PolyHavenSideboard() {
  const root = usePolyHavenModel(URLS.sideboard, dressSideboard)
  return <primitive object={root} />
}

/** Height of the sideboard's top. */
export const SIDEBOARD_TOP = 0.68

/* -------------------------------------------------------------------------- */
/* Office: the shelving unit                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Black steel to graphite, oak to off-white. The gap between the two is
 * deliberately a cliff, not a slope: nothing in the photograph sits between
 * steel and oak, and a gentle ramp there gave the steel a grey fringe.
 */
const STEEL_AND_OAK: Ramp = [
  [0, '#1e2023'],
  [60, '#35383d'],
  [95, '#cfc9bf'],
  [150, '#e2ddd4'],
  [220, '#efebe5'],
]

const dressShelving = (mesh: Mesh) => {
  mesh.material = rampDressed(mesh.material as MeshStandardMaterial, STEEL_AND_OAK, 'steel-oak', {
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
  })
}

/**
 * Poly Haven's "Drawer Cabinet": two open shelves over a bank of four
 * drawers, in a black steel frame, 1.14 x 0.49 x 1.88 m. The frame graphite,
 * the timber off-white — built-in joinery, as the living room's bookcase is.
 */
export function PolyHavenShelving() {
  const root = usePolyHavenModel(URLS.shelving, dressShelving)
  return <primitive object={root} />
}

/* -------------------------------------------------------------------------- */
/* Preloading                                                                 */
/* -------------------------------------------------------------------------- */

// Fetched as soon as the dev route loads this module: the armchair because
// the default room needs it immediately, the rest so that changing rooms
// never waits on the network. About 7.7 MB in all, from the local dev server.
for (const url of Object.values(URLS)) useGLTF.preload(url, NO_DRACO, NO_MESHOPT)
