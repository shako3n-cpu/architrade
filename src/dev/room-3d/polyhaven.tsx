import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, MeshPhysicalMaterial, Vector3, type Material, type Mesh, type MeshStandardMaterial, type Object3D } from 'three'
import { PALETTE } from './palette'

/**
 * ============================================================================
 * THE POLY HAVEN ARMCHAIR
 * ----------------------------------------------------------------------------
 * One CC0 model from polyhaven.com, 1k textures, stored under ./models and
 * loaded from there — never from a CDN:
 *
 *   modern_arm_chair_01   "Modern Arm Chair 01" by Vibrant Nordic
 *
 * It is the DEFAULT armchair. It was compared against the procedural one and
 * won: a real mid-century lounge chair, with a proper timber frame and the
 * creases of real cushions, where the procedural chair is rounded boxes.
 *
 * WHY THERE IS NO POLY HAVEN SOFA
 *   sofa_02 was downloaded alongside this and then deleted. It turned out to
 *   be a traditional tufted Chesterfield on carved feet — and every sofa Poly
 *   Haven has (Sofa_01, sofa_02, sofa_03, painted_wooden_sofa) is a
 *   traditional style, so no swap exists for the modern minimal brief. Its
 *   upholstery and its timber also shared one mesh and one texture, so the
 *   timber could not be recoloured separately. The procedural sofa stays.
 *
 * WHY THE FILES LIVE IN src/dev AND NOT IN public/
 *   Everything in public/ is copied into every production build. These are
 *   only fetched by the dev-only route, through `new URL(..., import.meta.url)`
 *   in a module the production build never includes, so they never reach
 *   dist/.
 *
 * TWO LOOKS
 *   'brand'  The model's GEOMETRY and its surface DETAIL — the normal map and
 *            the roughness map, which carry the grain and the creases — with
 *            the photographed COLOUR thrown away and the palette put back:
 *            off-white cushions with the same sheen as the procedural fabric,
 *            the timber frame stained graphite. The default.
 *   'raw'    Exactly as downloaded — walnut and black leather — for reference.
 *
 * Real-world scale, as modelled: 0.82 x 1.02 x 0.99 m.
 * ============================================================================
 */

export type ModelLook = 'brand' | 'raw'

const ARMCHAIR_URL = new URL('./models/modern_arm_chair_01/modern_arm_chair_01_1k.gltf', import.meta.url).href

/*
 * Draco and Meshopt both OFF. The model uses neither — checked in the file's
 * extensionsUsed — and drei's Draco default would point a decoder at
 * gstatic.com. Nothing here is allowed to reach a CDN.
 */
const NO_DRACO = false
const NO_MESHOPT = false

/**
 * Upholstery from a photographed material: its detail maps, the palette's
 * colour, and the sheen the procedural fabric has.
 */
function brandFabric(source: MeshStandardMaterial): Material {
  return new MeshPhysicalMaterial({
    color: PALETTE.fabricLight,
    // The packed ARM map's green channel is roughness; three reads it from
    // there. The colour map is deliberately NOT carried over.
    roughness: 1,
    roughnessMap: source.roughnessMap,
    metalness: 0,
    normalMap: source.normalMap,
    normalScale: source.normalScale.clone(),
    aoMap: source.aoMap,
    sheen: 1,
    sheenRoughness: 0.8,
    sheenColor: '#ffffff',
  })
}

/**
 * Timber, stained graphite. The grain stays — it is in the normal and
 * roughness maps — but the photographed walnut goes, because a mid-brown
 * frame is the one colour this palette does not have.
 */
function brandWood(source: MeshStandardMaterial): Material {
  return new MeshPhysicalMaterial({
    color: PALETTE.graphite,
    roughness: 1,
    roughnessMap: source.roughnessMap,
    metalness: 0,
    normalMap: source.normalMap,
    normalScale: source.normalScale.clone(),
    aoMap: source.aoMap,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
  })
}

/*
 * The model's "legs" material is its WHOLE timber frame — arms, back panel,
 * runners — not four legs. Brass there made a solid-brass chair: no longer an
 * accent, which is all brass is for in this palette. So the frame is stained
 * graphite and the cushions are off-white.
 */
function dress(mesh: Mesh) {
  const source = mesh.material as MeshStandardMaterial
  mesh.material = source.name.includes('legs') ? brandWood(source) : brandFabric(source)
}

/**
 * The armchair, normalised to the procedural pieces' conventions: origin at
 * the centre of its footprint, on the floor, front facing +Z (as modelled).
 *
 * Every mesh casts and receives shadow — set here rather than by DropIn,
 * because DropIn marks its children when it mounts, and a model that arrives
 * through Suspense is not there yet.
 */
export function PolyHavenArmchair({ look }: { look: ModelLook }) {
  const { scene } = useGLTF(ARMCHAIR_URL, NO_DRACO, NO_MESHOPT)

  const model = useMemo(() => {
    // A clone, so the cached original keeps its own materials and switching
    // between 'brand' and 'raw' needs no reload.
    const root = scene.clone(true)

    root.traverse((object: Object3D) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      if (look === 'brand') dress(mesh)
    })

    root.updateMatrixWorld(true)
    const box = new Box3().setFromObject(root)
    const centre = box.getCenter(new Vector3())
    root.position.set(-centre.x, -box.min.y, -centre.z)
    return root
  }, [scene, look])

  return <primitive object={model} />
}

// Fetched as soon as the dev route loads this module — it is the default
// armchair, so it is needed immediately. 2.6 MB, from the local dev server.
useGLTF.preload(ARMCHAIR_URL, NO_DRACO, NO_MESHOPT)
