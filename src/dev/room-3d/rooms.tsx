import { Bed, StyledSideboard, StyledSideTable, TableLamp } from './bedroom'
import { DropIn } from './drop-in'
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
  WallArt,
} from './furniture'
import { COUNTER_TOP, Island, KitchenRun, PendantPair, StoolPair } from './kitchen'
import { Vase } from './styling'
import { DESK_TOP, Desk, DeskChair, DeskLamp, StyledShelving } from './office'
import { PolyHavenArmchair, SIDE_TABLE_01_TOP } from './polyhaven'
import type { ArmchairMode } from './room-types'
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

export function LivingRoom({ armchair }: { armchair: ArmchairMode }) {
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

      {/*
       * Turned to face the coffee table. Keyed by the mode so a switch
       * REMOUNTS the DropIn: it marks its meshes for shadows once, on mount,
       * and the procedural chair swapped in later would otherwise arrive
       * without them.
       */}
      <DropIn key={`armchair-${armchair}`} index={3} position={[1.85, 0, 0.6]} rotationY={-1.84} spin={-0.36}>
        {armchair === 'procedural' ? (
          <Armchair />
        ) : (
          <PolyHavenArmchair look={armchair === 'polyhaven-raw' ? 'raw' : 'brand'} />
        )}
      </DropIn>

      <DropIn index={4} position={[-1.45, 0, -1.7]} spin={0.22}>
        <FloorLamp />
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

      {/* Along the back wall, its left end against the left wall. */}
      <DropIn index={0} position={[-0.9, 0, -2.19]} spin={-0.1}>
        <KitchenRun />
      </DropIn>

      <DropIn index={1} position={[ISLAND[0], 0, ISLAND[1]]} spin={0.22}>
        <Island />
      </DropIn>

      {/* On the island's seating side, turned to face it. */}
      <DropIn index={2} position={[ISLAND[0], 0, ISLAND[1] + 0.82]} rotationY={Math.PI} spin={-0.3}>
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
    </>
  )
}

/* -------------------------------------------------------------------------- */

/** The bedside table's centre, to the bed's right, back against the wall. */
const NIGHTSTAND: [number, number] = [1.46, -2.24]

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
      <DropIn index={0} position={[0.1, 0, -1.39]} spin={-0.12}>
        <Bed />
        <group position={[0, 0, 0.62]}>
          <Rug style="banded" />
        </group>
      </DropIn>

      <DropIn index={1} position={[NIGHTSTAND[0], 0, NIGHTSTAND[1]]} spin={0.34}>
        <StyledSideTable />
      </DropIn>

      {/* A little right of centre, to leave the books beside it room. */}
      <DropIn index={2} position={[NIGHTSTAND[0] + 0.08, SIDE_TABLE_01_TOP, NIGHTSTAND[1] + 0.02]} height={0.9} spin={-0.4}>
        <TableLamp />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={3} position={[-2.72, 0, -0.75]} rotationY={Math.PI / 2} spin={0.2}>
        <StyledSideboard />
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
      <DropIn index={0} position={[DESK[0], 0, DESK[1]]} spin={-0.2}>
        <Desk />
        <group position={[0, 0, 0.3]}>
          <Rug style="border" />
        </group>
      </DropIn>

      {/* Pulled out from the desk on the room side, turned a little towards
          the camera. It stood behind the desk at first, facing out — and
          from where the room is seen the desk hid it; with graphite
          upholstery on the graphite rug, it read as missing. */}
      <DropIn index={1} position={[DESK[0] + 0.08, 0, DESK[1] + 0.72]} rotationY={Math.PI - 0.35} spin={0.5}>
        <DeskChair />
      </DropIn>

      {/* At the desk's back-left corner, its shade turned in over the desk and
          towards the sitter — and so, from where the room is seen, open. */}
      <DropIn index={2} position={[DESK[0] - 0.62, DESK_TOP, DESK[1] - 0.2]} rotationY={0.6} height={0.9} spin={-0.4}>
        <DeskLamp />
      </DropIn>

      {/* Against the left wall, facing into the room. */}
      <DropIn index={3} position={[-2.74, 0, -1.05]} rotationY={Math.PI / 2} spin={-0.22}>
        <StyledShelving />
      </DropIn>
    </>
  )
}
