import type { CategoryNode } from '@/lib/category-tree'

/**
 * ============================================================================
 * WHERE A DRAGGED CATEGORY WOULD LAND
 * ----------------------------------------------------------------------------
 * A tree drawn as one flat list of indented rows, which is what the admin
 * screen is, has an awkward property: vertical position and nesting are two
 * different questions and a drag is one gesture. Dropping a row between
 * "Office" and "Office Desks" could mean "last child of Office" or "sibling
 * after Office", and the pointer cannot tell them apart.
 *
 * So the horizontal offset decides. Drag up and down to choose the position,
 * drag right to nest one level deeper, drag left to come back out. The screen
 * draws the row at the depth this reports while the drag is in progress, so
 * the answer is visible before the mouse is released rather than after.
 *
 * NO REACT HERE, AND NO DATABASE
 *   Every function is pure. That is deliberate: this is the part with the
 *   arithmetic, the clamping and the off-by-one risks, and keeping it separate
 *   means it can be reasoned about — and later tested — without a rendered
 *   tree or a network call in the way.
 * ============================================================================
 */

/** One row as the drag sees it: identity, nesting, and nothing else. */
export interface FlatRow {
  id: string
  parentId: string | null
  depth: number
}

/** The visible rows, flattened to what the drag arithmetic needs. */
export function toFlatRows(nodes: CategoryNode[]): FlatRow[] {
  return nodes.map((node) => ({
    id: node.category.id,
    parentId: node.category.parent_id ?? null,
    depth: node.depth,
  }))
}

/** Moves one entry, returning a new array. */
export function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export interface Projection {
  /** The depth the row would take. */
  depth: number
  /** The parent it would belong to, or null for top level. */
  parentId: string | null
}

/**
 * Where the row being dragged would end up if it were dropped right now.
 *
 * The depth the pointer ASKS for is the row's original depth plus however many
 * indent steps it has been dragged sideways. That is then clamped, because
 * most of what the pointer can ask for is not a real place in a tree:
 *
 *   maxDepth  one deeper than the row above — you can become its child, but
 *             you cannot be a grandchild of a row that is not there.
 *   minDepth  the depth of the row below, so a row can never be shallower
 *             than something that is supposed to be inside it.
 *
 * Returns null when there is nothing to project onto, which is the "dropped on
 * itself" case and means: change nothing.
 */
export function project(
  rows: FlatRow[],
  activeId: string,
  overId: string,
  dragOffsetX: number,
  indentWidth: number,
): Projection | null {
  const activeIndex = rows.findIndex((row) => row.id === activeId)
  const overIndex = rows.findIndex((row) => row.id === overId)
  if (activeIndex < 0 || overIndex < 0) return null

  const moved = arrayMove(rows, activeIndex, overIndex)
  const above = moved[overIndex - 1]
  const below = moved[overIndex + 1]

  const asked = rows[activeIndex].depth + Math.round(dragOffsetX / indentWidth)
  const maxDepth = above ? above.depth + 1 : 0
  const minDepth = below ? below.depth : 0
  const depth = Math.min(Math.max(asked, minDepth), maxDepth)

  return { depth, parentId: parentAtDepth(moved, overIndex, depth, above) }
}

/**
 * Which row owns a slot at `depth`, given what sits above it.
 *
 * Three cases, and the third is the one worth spelling out. Coming OUT of a
 * branch — dragging left past several levels at once — the new parent is not
 * the row above and not the row above's parent either. It is whichever
 * ancestor sits at the depth being asked for, so the list is walked backwards
 * until a row at that depth turns up and its parent is taken.
 */
function parentAtDepth(
  moved: FlatRow[],
  overIndex: number,
  depth: number,
  above: FlatRow | undefined,
): string | null {
  if (depth === 0 || !above) return null
  if (depth === above.depth) return above.parentId
  if (depth > above.depth) return above.id

  const ancestor = moved
    .slice(0, overIndex)
    .reverse()
    .find((row) => row.depth === depth)

  return ancestor?.parentId ?? null
}

/**
 * The ids of everything that would sit under `parentId`, in their new order.
 *
 * This is what the reorder call needs: sort_order is stored per row and scoped
 * to the parent, so renumbering means naming every sibling in the group the
 * dragged row has joined — including the ones that did not move, whose
 * positions have shifted by one because it arrived.
 */
export function siblingOrder(
  rows: FlatRow[],
  activeId: string,
  overId: string,
  parentId: string | null,
): string[] {
  const activeIndex = rows.findIndex((row) => row.id === activeId)
  const overIndex = rows.findIndex((row) => row.id === overId)
  if (activeIndex < 0 || overIndex < 0) return []

  return arrayMove(rows, activeIndex, overIndex)
    .map((row) => (row.id === activeId ? { ...row, parentId } : row))
    .filter((row) => row.parentId === parentId)
    .map((row) => row.id)
}
