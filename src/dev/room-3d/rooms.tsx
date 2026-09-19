import { BedsideTable, Bed, StyledSideboard } from './bedroom'
import { DropIn } from './drop-in'
import {
  Armchair,
  Bookshelf,
  CoffeeTable,
  COFFEE_TABLE_TOP,
  FloorLamp,
  OliveTree,
  Plant,
  Rug,
  SIDE_TABLE_TOP,
  SideTable,
  Sofa,
  TableStyling,
  WallArt,
} from './furniture'
import { COUNTER_TOP, Island, KitchenRun, PendantPair, StoolPair } from './kitchen'
import { Vase } from './styling'
import { DESK_TOP, Desk, DeskChair, DeskLamp, StyledShelving } from './office'
import { PolyHavenArmchair } from './polyhaven'
import type { ArmchairMode } from './room-types'
import { ON_RUG } from './contact-shadow'
import { ArchPrint, RingPrint, RoundMirror } from './wall-art'
import { WallTreatment } from './walls'

/**
 * ============================================================================
 * THE FOUR ROOMS
 * ----------------------------------------------------------------------------
 * The same empty shell (room.tsx), furnished four ways. Each layout lists its
 * pieces in the order they arrive: the big thing that defines the room
 * first, what stands on or hangs over it after, so every surface is already
 * there when something lands on it. When the room changes they leave in the
 * reverse order — see furnish-clock.ts.
 *
 * Each layout's piece count is registered beside it in room-registry.ts.
 *
 * The shell for reference:  floor x -3..3, z -2.5..2.5; back wall inner face
 * at z = -2.5; left wall inner face at x = -3; the camera looks in from the
 * front right.
 *
 * `shade` is a floor-standing piece's footprint, for its contact shadow
 * (contact-shadow.ts); `ground={ON_RUG}` lays that shadow on a rug's top.
 *
 * A room's wall treatment (walls.tsx) is listed with it but is not a piece:
 * it washes in with the first piece and out with the last, and does not
 * count towards `pieces`.
 *
 * Spin alternates in sign so a room does not appear to turn as a whole. The
 * biggest pieces — the kitchen run, the bed — barely turn at all: four metres
 * of cupboards swinging through twenty degrees reads as thrown.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */

/**
 * The seating group, as a stylist lays one out: the rug under the sofa's
 * front feet and the armchair's, the coffee table half a metre from the sofa's
 * cushions, the side table at the sofa's arm. Laid out first with the rug
 * and table out in the middle of the room, the sofa stood 70cm off the rug,
 * over a metre from its table: three pieces near each other, not a group.
 */
const RUG = { x: 0.2, z: -0.32, width: 3.2, depth: 2.6 }
const COFFEE_TABLE: [number, number] = [0.2, -0.45]
const SIDE_TABLE: [number, number] = [1.72, -1.95]

export function LivingRoom({ armchair }: { armchair: ArmchairMode }) {
  return (
    <>
      <DropIn index={0} position={[RUG.x, 0, RUG.z]} height={0.9} spin={0.08}>
        <Rug width={RUG.width} depth={RUG.depth} />
      </DropIn>

      <DropIn index={1} position={[0.2, 0, -1.97]} spin={-0.28} shade={[{ size: [2.3, 0.95] }]}>
        <Sofa />
      </DropIn>

      <DropIn
        index={2}
        position={[COFFEE_TABLE[0], 0, COFFEE_TABLE[1]]}
        spin={0.34}
        shade={[{ size: [1.04, 1.04], round: true }]}
        ground={ON_RUG}
      >
        <CoffeeTable />
      </DropIn>

      {/*
       * Across the rug from the sofa's right end, turned to face the coffee
       * table, its front feet on the rug. Keyed by the mode so a switch
       * REMOUNTS the DropIn: it marks its meshes for shadows once, on mount,
       * and the procedural chair swapped in later would otherwise arrive
       * without them.
       */}
      <DropIn
        key={`armchair-${armchair}`}
        index={3}
        position={[1.86, 0, 0.3]}
        rotationY={-2}
        spin={-0.36}
        shade={[{ size: [0.82, 0.99] }]}
        ground={ON_RUG}
      >
        {armchair === 'procedural' ? (
          <Armchair />
        ) : (
          <PolyHavenArmchair look={armchair === 'polyhaven-raw' ? 'raw' : 'brand'} />
        )}
      </DropIn>

      <DropIn index={4} position={[-1.45, 0, -1.7]} spin={0.22} shade={[{ size: [0.38, 0.38], round: true }]}>
        <FloorLamp />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={5} position={[-2.8, 0, -0.35]} rotationY={Math.PI / 2} spin={-0.2} shade={[{ size: [1.3, 0.34] }]}>
        <Bookshelf />
      </DropIn>

      {/* At the sofa's right arm, where a hand reaches it. */}
      <DropIn index={6} position={[SIDE_TABLE[0], 0, SIDE_TABLE[1]]} spin={0.3} shade={[{ size: [0.4, 0.4], round: true }]}>
        <SideTable />
      </DropIn>

      <DropIn index={7} position={[-2.42, 0, -2.05]} spin={-0.4} shade={[{ size: [0.42, 0.42], round: true }]}>
        <Plant />
      </DropIn>

      <DropIn index={8} position={[0.2, 1.22, -2.5]} height={1.1} spin={0}>
        <WallArt />
      </DropIn>

      <DropIn index={9} position={[SIDE_TABLE[0], SIDE_TABLE_TOP, SIDE_TABLE[1]]} height={0.9} spin={0.5}>
        <Vase />
      </DropIn>

      <DropIn index={10} position={[COFFEE_TABLE[0], COFFEE_TABLE_TOP, COFFEE_TABLE[1]]} height={0.8} spin={-0.12}>
        <TableStyling />
      </DropIn>
    </>
  )
}

/* -------------------------------------------------------------------------- */

/** The island's centre. The stools and the pendants are placed from it. */
const ISLAND: [number, number] = [0.25, -0.2]

/**
 * The backsplash runs the length of the base units — from the fridge's side
 * (the run starts at the left wall, x = -3, and the fridge is 65cm wide) to
 * the run's right end at 1.2 — and from the worktop to just under the
 * floating shelf: six rows of 10cm tile.
 */
const BACKSPLASH: [number, number] = [-2.35, 1.2]

export function Kitchen() {
  return (
    <>
      <WallTreatment finish="tile" wall="back" span={BACKSPLASH} height={[COUNTER_TOP, COUNTER_TOP + 0.6]} />

      {/* Along the back wall, its left end against the left wall; the pantry at
          its right end stands at x = 1.2 to 1.85. */}
      <DropIn index={0} position={[-0.9, 0, -2.19]} spin={-0.1} shade={[{ size: [4.85, 0.62], at: [0.325, 0] }]}>
        <KitchenRun />
      </DropIn>

      <DropIn index={1} position={[ISLAND[0], 0, ISLAND[1]]} spin={0.22} shade={[{ size: [2, 0.72] }]}>
        <Island />
      </DropIn>

      {/* On the island's seating side, turned to face it. */}
      <DropIn
        index={2}
        position={[ISLAND[0], 0, ISLAND[1] + 0.82]}
        rotationY={Math.PI}
        spin={-0.3}
        shade={[
          { size: [0.42, 0.4], at: [-0.45, 0] },
          { size: [0.42, 0.4], at: [0.45, 0] },
        ]}
      >
        <StoolPair />
      </DropIn>

      {/* Hung from the ceiling line — the top of the walls — over the island.
          They come down from just above it rather than from high up: a
          pendant is lowered, not dropped. Set over the island's front half:
          two metres up, a pendant over its middle projected onto the worktop
          behind it and read as hanging over the wrong counter. */}
      <DropIn index={3} position={[ISLAND[0], 2.8, ISLAND[1] + 0.3]} height={0.9} spin={0.12}>
        <PendantPair />
      </DropIn>

      {/* The long left wall was the one bare plane in the room, a third of the
          picture with nothing on it while everything stood back and right.
          An arch print in oak, oversized — at its own 0.9 x 1.2m it read small
          against five metres of wall — hung mid-wall. */}
      <DropIn index={4} position={[-3, 0.95, -0.3]} rotationY={Math.PI / 2} height={1.1} spin={0}>
        <group scale={1.2}>
          <ArchPrint />
        </group>
      </DropIn>
    </>
  )
}

/* -------------------------------------------------------------------------- */

/** The bed's centre line, and its bedside tables either side of it, backs to the wall. */
const BED_X = 0.1
const NIGHTSTAND_OFFSET = 1.36
const NIGHTSTAND_Z = -2.24

export function Bedroom() {
  return (
    <>
      <WallTreatment finish="limewash" wall="back" />

      {/*
       * Headboard to the back wall, in the middle of it — on its own rug,
       * which comes down with it: a bed on bare boards in a room this size
       * read as a mattress in an empty flat. The rug is 3.2 x 2.4m, laid from
       * a third of the way down the bed to 70cm past its foot and 64cm past
       * each side, and bordered, so the part that shows reads as a whole rug.
       * The first one was the living room's 3 x 2.1 lattice, and from the
       * camera it looked like a fragment poking out from under the bed.
       */}
      <DropIn index={0} position={[BED_X, 0, -1.39]} spin={-0.12} shade={[{ size: [1.92, 2.22] }]} ground={ON_RUG}>
        <Bed />
        <group position={[0, 0, 0.62]}>
          <Rug style="banded" />
        </group>
      </DropIn>

      {/*
       * A matching bedside table and lamp either side of the bed, each one
       * piece. The bed had one, on its right, and two metres of bare wall
       * on its left: the room leaned. The pair are 1.36m either side of the
       * bed's centre, backs to the wall.
       */}
      <DropIn index={1} position={[BED_X + NIGHTSTAND_OFFSET, 0, NIGHTSTAND_Z]} spin={0.34} shade={[{ size: [0.55, 0.45] }]}>
        <BedsideTable side="right" />
      </DropIn>

      <DropIn index={2} position={[BED_X - NIGHTSTAND_OFFSET, 0, NIGHTSTAND_Z]} spin={-0.34} shade={[{ size: [0.55, 0.45] }]}>
        <BedsideTable side="left" />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={3} position={[-2.72, 0, -0.75]} rotationY={Math.PI / 2} spin={0.2} shade={[{ size: [2.44, 0.52] }]}>
        <StyledSideboard />
      </DropIn>

      {/* Over the sideboard, centred on it, 28cm above its top: the round
          mirror that wall was missing. */}
      <DropIn index={4} position={[-3, 0.96, -0.75]} rotationY={Math.PI / 2} height={1.1} spin={0}>
        <RoundMirror />
      </DropIn>
    </>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * The desk's centre. It stands out in the room, in front of the graphite
 * wall, rather than against it: pushed back there, a 1.6m desk left
 * four-fifths of the floor empty and the room read as unfurnished.
 */
const DESK: [number, number] = [-0.1, -0.75]

export function Office() {
  return (
    <>
      <WallTreatment finish="graphite" wall="back" />

      {/* Sitting side (+Z) towards the room. On a graphite rug that runs
          under the chair too — it comes down with the desk, as the bedroom's
          comes with the bed. */}
      <DropIn index={0} position={[DESK[0], 0, DESK[1]]} spin={-0.2} shade={[{ size: [1.6, 0.75] }]} ground={ON_RUG}>
        <Desk />
        <group position={[0, 0, 0.3]}>
          <Rug style="border" />
        </group>
      </DropIn>

      {/* Pulled out from the desk on the room side, turned a little towards
          the camera. It stood behind the desk at first, facing out — and
          from where the room is seen the desk hid it; with graphite
          upholstery on the graphite rug, it read as missing. */}
      <DropIn
        index={1}
        position={[DESK[0] + 0.08, 0, DESK[1] + 0.72]}
        rotationY={Math.PI - 0.35}
        spin={0.5}
        shade={[{ size: [0.64, 0.64], round: true }]}
        ground={ON_RUG}
      >
        <DeskChair />
      </DropIn>

      {/* At the desk's back-left corner, its shade turned in over the desk and
          towards the sitter — and so, from where the room is seen, open. */}
      <DropIn index={2} position={[DESK[0] - 0.62, DESK_TOP, DESK[1] - 0.2]} rotationY={0.6} height={0.9} spin={-0.4}>
        <DeskLamp />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={3} position={[-2.74, 0, -1.05]} rotationY={Math.PI / 2} spin={-0.22} shade={[{ size: [1.14, 0.49] }]}>
        <StyledShelving />
      </DropIn>

      {/* Six metres of graphite with nothing on it: a ring print in brass,
          centred behind the desk and hung above the lamp's reach. */}
      <DropIn index={4} position={[DESK[0], 1.3, -2.5]} height={1.1} spin={0}>
        <RingPrint />
      </DropIn>

      {/* The back-right corner, where the room was empty: an olive tree, so
          the office's weight is not all left of centre — shelving, desk and
          print — and so it has something growing in it. */}
      <DropIn index={5} position={[2.45, 0, -2.05]} spin={0.3} shade={[{ size: [0.46, 0.46], round: true }]}>
        <OliveTree />
      </DropIn>
    </>
  )
}
