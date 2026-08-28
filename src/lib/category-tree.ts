import type { Category, Product } from '@/data/types'

/**
 * ============================================================================
 * THE CATEGORY TREE
 * ----------------------------------------------------------------------------
 * The database stores categories as a flat list with a `parent_id`. Every
 * screen that shows them — the mega menu, the mobile drawer, the filter rail,
 * the admin manager, the breadcrumb — needs the same tree built the same way,
 * so it is built once, here, with no React in sight.
 *
 * WORKS ON AN UN-MIGRATED DATABASE
 *   `parent_id`, `is_active` and `featured` are optional on Category (see the
 *   note there). A database without them returns every row with those fields
 *   undefined, which lands here as: no parents, everything active, nothing
 *   featured — i.e. exactly the flat catalogue the site had before. Nothing
 *   needs a feature flag; the absent columns ARE the flag.
 * ============================================================================
 */

export interface CategoryNode {
  category: Category
  children: CategoryNode[]
  /** 0 for a top-level row, 1 for its children, and so on. */
  depth: number
  /** Products filed directly on this category. */
  ownCount: number
  /** Products on this category AND everything beneath it. */
  totalCount: number
}

/** A row with no parent, or whose parent is missing from the list. */
function isRoot(category: Category, byId: Map<string, Category>): boolean {
  const parent = category.parent_id
  if (!parent) return true
  // A dangling parent_id would otherwise silently drop the whole branch. Being
  // treated as top-level is wrong, but it is visible and recoverable, which
  // "vanished from the site" is not.
  return !byId.has(parent)
}

/** Ascending by sort_order, then by title so ties are at least stable. */
function inOrder(a: Category, b: Category): number {
  const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0)
  if (byOrder !== 0) return byOrder
  return a.slug.localeCompare(b.slug)
}

/**
 * Builds the tree, counting products as it goes.
 *
 * Counting has to happen bottom-up — a parent's total is its own plus every
 * descendant's — so it is done on the way back out of the recursion rather
 * than in a second pass over the finished tree.
 *
 * Cycles are impossible in the database (a trigger refuses them, see
 * supabase-category-tree.sql), but this runs against whatever the API returns,
 * so a `seen` set bounds the walk regardless. A row that would repeat is
 * dropped rather than followed.
 */
export function buildCategoryTree(
  categories: Category[],
  products: Product[] = [],
): CategoryNode[] {
  const byId = new Map(categories.map((category) => [category.id, category]))

  const childrenOf = new Map<string, Category[]>()
  for (const category of categories) {
    if (isRoot(category, byId)) continue
    const list = childrenOf.get(category.parent_id as string)
    if (list) list.push(category)
    else childrenOf.set(category.parent_id as string, [category])
  }

  const directCount = new Map<string, number>()
  for (const product of products) {
    if (!product.category_id) continue
    directCount.set(product.category_id, (directCount.get(product.category_id) ?? 0) + 1)
  }

  const seen = new Set<string>()

  const build = (category: Category, depth: number): CategoryNode => {
    seen.add(category.id)

    const children = (childrenOf.get(category.id) ?? [])
      .filter((child) => !seen.has(child.id))
      .sort(inOrder)
      .map((child) => build(child, depth + 1))

    const ownCount = directCount.get(category.id) ?? 0

    return {
      category,
      children,
      depth,
      ownCount,
      totalCount: children.reduce((sum, child) => sum + child.totalCount, ownCount),
    }
  }

  return categories
    .filter((category) => isRoot(category, byId))
    .sort(inOrder)
    .map((category) => build(category, 0))
}

/**
 * The tree as the public site is allowed to show it.
 *
 * TWO REASONS A BRANCH DISAPPEARS, AND THEY ARE DIFFERENT
 *   `is_active === false` is the office saying "not now". Empty is the
 *   catalogue saying "there is nothing here". Both are hidden, because a menu
 *   link that leads to an empty page teaches a visitor that browsing does not
 *   work — which is the habit this navigation exists to break — but only the
 *   first is a decision, and the admin screen labels them differently.
 *
 * A parent survives on its descendants' stock: an empty parent whose children
 * hold products is exactly what "Office > Office Desks" is.
 */
export function publicTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes
    .filter((node) => node.category.is_active !== false)
    .map((node) => ({ ...node, children: publicTree(node.children) }))
    .filter((node) => node.totalCount > 0)
}

/** Depth-first, parents before children — the order a nested list renders in. */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)])
}

/** The node for one slug, anywhere in the tree. Null when there is no such row. */
export function findNode(nodes: CategoryNode[], slug: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.category.slug === slug) return node
    const found = findNode(node.children, slug)
    if (found) return found
  }
  return null
}

/**
 * The path from the top-level row down to `slug`, inclusive — the breadcrumb.
 *
 * Walks UP the flat list rather than searching the tree, so it costs the depth
 * of one branch instead of a traversal, and works even when the caller never
 * built a tree. Returns an empty array for a slug that does not exist.
 */
export function ancestorPath(categories: Category[], slug: string): Category[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]))
  const byId = new Map(categories.map((category) => [category.id, category]))

  const start = bySlug.get(slug)
  if (!start) return []

  const path: Category[] = [start]
  const seen = new Set([start.id])

  let current = start
  while (current.parent_id) {
    const parent = byId.get(current.parent_id)
    if (!parent || seen.has(parent.id)) break
    path.unshift(parent)
    seen.add(parent.id)
    current = parent
  }

  return path
}

/**
 * Every category id at or beneath `slug`.
 *
 * This is what makes a parent page show its children's products: browsing to
 * Office should show everything in Office Desks and Office Chairs, not the
 * nothing that is filed directly on Office itself.
 */
export function subtreeIds(nodes: CategoryNode[], slug: string): string[] {
  const node = findNode(nodes, slug)
  if (!node) return []
  return flattenTree([node]).map((entry) => entry.category.id)
}

/** Top-level rows the office has pinned, for the menu's highlighted column. */
export function featuredNodes(nodes: CategoryNode[]): CategoryNode[] {
  return flattenTree(nodes).filter((node) => node.category.featured === true)
}
