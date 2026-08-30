import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/ui/media'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { Breadcrumbs, type Crumb } from '@/components/ui/breadcrumbs'
import { ProductCard } from '@/components/catalog/product-card'
import { useCategoryPage } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import { categoryImage, categoryImageAlt, categoryTitle } from '@/lib/localize'
import { ancestorPath, buildCategoryTree, findNode } from '@/lib/category-tree'
import { cn } from '@/lib/utils'

/**
 * One category: /ka/catalog/living-room
 *
 * The slug in the address is matched against `categories.slug`, and the grid
 * shows the pieces whose `category_id` points at that row — so a category is
 * filtered by what the database says belongs to it, never by anything parsed
 * out of the URL beyond the slug itself.
 *
 * The category, its pieces and the browse row all arrive from a single hook,
 * so the page has one loading state rather than three that finish at different
 * moments and shuffle the layout as they land.
 */
export function CategoryPage() {
  // Must match the :categorySlug segment declared in src/App.tsx.
  const { categorySlug = '' } = useParams<{ categorySlug: string }>()
  const page = useCategoryPage(categorySlug)

  return (
    <QueryState result={page} skeleton={<CategorySkeleton />}>
      {({ category, products, categories }) =>
        // A slug that matches no row is a mistyped address, not a server
        // failure, so it gets its own state instead of the error panel.
        category ? (
          <CategoryView category={category} products={products} categories={categories} />
        ) : (
          <NotFound />
        )
      }
    </QueryState>
  )
}

/** The page proper, once the category is known to exist. */
function CategoryView({
  category,
  products,
  categories,
}: {
  category: Category
  products: Product[]
  categories: Category[]
}) {
  const { lang, t } = useLanguage()

  const title = categoryTitle(category, lang)
  const image = categoryImage(category)

  const crumbs: Crumb[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.catalog'), to: '/catalog' },
    { label: title },
  ]

  return (
    <>
      <Section spacing="md">
        <Container>
          <Breadcrumbs items={crumbs} className="mb-10" />

          <SectionHeading
            as="h1"
            eyebrow={t('catalog.resultCount', { count: products.length })}
            title={title}
          />

          {/* The categories table has no description columns — see the note in
              src/data/types.ts — so the photograph carries the introduction. */}
          {image && (
            <Media
              src={image}
              alt={categoryImageAlt(category, lang)}
              ratio="panorama"
              loading="eager"
              sizes="100vw"
              className="mt-12"
            />
          )}

          <CategoryBrowse categories={categories} activeSlug={category.slug} className="mt-12" />
        </Container>
      </Section>

      <Section spacing="sm" bordered>
        <Container>
          {products.length === 0 ? (
            <Panel title={t('category.emptyTitle')} body={t('category.emptyBody')} />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={category}
                  // Only the first row is above the fold on a desktop screen.
                  eager={index < 4}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}

/**
 * The row of categories under the heading, so a visitor can move through the
 * catalogue without going back to the index first.
 *
 * IT SHOWS ONE LEVEL, NOT THE WHOLE TABLE
 *   This used to render every category as a flat wrapping list. That was fine
 *   at seven rows and became unusable at twenty-nine: measured on a 375px
 *   screen the wrapped list stood 1032px tall — taller than the viewport — so
 *   the pieces the page exists to show began a full screen below the fold.
 *
 *   The category tree fixed the data and broke this control, because the
 *   control was written when the table was flat. So it now shows ONE level:
 *
 *     a category with children -> its children, the step down
 *     a leaf                   -> its siblings, the step sideways
 *
 *   Both are a handful of rows rather than the whole table, and both answer
 *   the question actually being asked at that point in the catalogue. The
 *   parent is offered beside them as the way back up, so no level is a dead
 *   end.
 *
 * AND IT SCROLLS RATHER THAN WRAPS
 *   Wrapping is what turned a long list into a wall. A single non-wrapping row
 *   that scrolls sideways cannot grow downward however many categories the
 *   office adds, so the same regression cannot happen twice. From `sm` there
 *   is width to wrap onto a line or two, so it does.
 *
 * Driven by the categories table, so adding a category in Supabase adds it
 * here with no edit to this file. Inactive rows are dropped: they are hidden
 * everywhere else, and a chip leading to a hidden category is a dead end.
 */
function CategoryBrowse({
  categories,
  activeSlug,
  className,
}: {
  categories: Category[]
  activeSlug: string
  className?: string
}) {
  const { lang, localePath, t } = useLanguage()
  const scroller = useRef<HTMLUListElement>(null)
  const activeItem = useRef<HTMLLIElement>(null)

  const { showingChildren, rows, parent } = useMemo(() => {
    const visible = categories.filter((item) => item.is_active !== false)
    const tree = buildCategoryTree(visible)
    const node = findNode(tree, activeSlug)

    // Not in the visible tree: the row itself is inactive, reachable only by
    // typing its address. Offer the top-level categories rather than nothing,
    // so the page still has a way out that is not the browser's back button.
    if (!node) {
      return {
        showingChildren: false,
        rows: tree.map((branch) => branch.category),
        parent: null as Category | null,
      }
    }

    if (node.children.length > 0) {
      return {
        showingChildren: true,
        rows: node.children.map((child) => child.category),
        parent: null as Category | null,
      }
    }

    // A leaf. Its siblings are the other children of its parent; a top-level
    // leaf has no parent, so the other top-level rows are its siblings.
    const path = ancestorPath(visible, activeSlug)
    const parentCategory = path.length > 1 ? (path[path.length - 2] ?? null) : null
    const parentNode = parentCategory ? findNode(tree, parentCategory.slug) : null

    return {
      showingChildren: false,
      rows: parentNode
        ? parentNode.children.map((child) => child.category)
        : tree.map((branch) => branch.category),
      parent: parentCategory,
    }
  }, [categories, activeSlug])

  /*
   * Bring the selected chip into view within the row.
   *
   * By setting scrollLeft on the row itself, never scrollIntoView — that walks
   * up the ancestors and scrolls the PAGE to reach a chip which is merely off
   * to the right, pulling the heading out from under the visitor on arrival.
   */
  useEffect(() => {
    const row = scroller.current
    const chip = activeItem.current
    if (!row || !chip) return

    const centred = chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2
    row.scrollLeft = Math.max(0, Math.min(centred, row.scrollWidth - row.clientWidth))
  }, [activeSlug, rows])

  // A leaf with no siblings has nothing to offer here; the breadcrumb is
  // already the way back. An empty nav with a heading over it is worse.
  if (rows.length === 0) return null

  return (
    <nav aria-label={t('category.browseLabel')} className={className}>
      <Eyebrow as="p" className="mb-5 text-muted">
        {showingChildren ? t('category.inThisCategory') : t('category.otherCategories')}
      </Eyebrow>

      {/* `-mx-5 px-5` cancels the Container gutter so the row scrolls from one
          screen edge to the other, and the last chip is cut off by the screen
          rather than appearing to stop short of it. Container opens to px-8 at
          `sm`, where this wraps instead and the bleed is not wanted. */}
      <ul
        ref={scroller}
        className="at-scroll-row -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        <li className="shrink-0">
          <Chip to={localePath('/catalog')}>{t('catalog.allProducts')}</Chip>
        </li>

        {/* The way back up, next to "all" — the two widening moves together. */}
        {parent && (
          <li className="shrink-0">
            <Chip to={localePath(`/catalog/${parent.slug}`)}>{categoryTitle(parent, lang)}</Chip>
          </li>
        )}

        {rows.map((item) => {
          const active = item.slug === activeSlug

          return (
            <li key={item.id} ref={active ? activeItem : undefined} className="shrink-0">
              <Chip to={localePath(`/catalog/${item.slug}`)} active={active}>
                {categoryTitle(item, lang)}
              </Chip>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * One category in the browse row.
 *
 * The active one is deliberately NOT a link: a link to the page you are
 * already on is a dead control, the same reason the last breadcrumb is plain
 * text. It keeps aria-current so a screen reader still announces which one it
 * is.
 */
function Chip({
  to,
  active = false,
  children,
}: {
  to: string
  active?: boolean
  children: ReactNode
}) {
  // min-h-11 keeps the chips a comfortable 44px on touch screens; they relax
  // back to their natural height once there is a pointer. `whitespace-nowrap`
  // is what stops a two-word Georgian name breaking over two lines and making
  // its chip twice the height of the ones beside it.
  const classes =
    'inline-flex min-h-11 items-center border px-4 py-2 text-xs whitespace-nowrap tracking-[0.12em] uppercase sm:min-h-0'

  if (active) {
    return (
      <span aria-current="page" className={cn(classes, 'border-brass text-brass')}>
        {children}
      </span>
    )
  }

  return (
    <Link
      to={to}
      className={cn(
        classes,
        'border-hairline text-muted transition-colors duration-300 hover:border-brass hover:text-brass',
      )}
    >
      {children}
    </Link>
  )
}

/** Shown when the slug in the address matches no category. */
function NotFound() {
  const { localePath, t } = useLanguage()

  return (
    <Section spacing="lg">
      <Container>
        <Panel
          as="h1"
          title={t('category.notFoundTitle')}
          body={t('category.notFoundBody')}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={localePath('/catalog')}>{t('category.backToCatalog')}</Link>
            </Button>
          }
        />
      </Container>
    </Section>
  )
}

/** Centred hairline-bounded panel, matching the one QueryState draws. */
function Panel({
  title,
  body,
  action,
  as: Tag = 'h2',
}: {
  title: string
  body: string
  action?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center border-t border-b border-hairline px-6 py-20 text-center"
    >
      <Tag className={cn('font-heading text-ink', Tag === 'h1' ? 'text-3xl' : 'text-2xl')}>
        {title}
      </Tag>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{body}</p>

      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

/** Grey boxes in the shape of the layout that is about to replace them. */
function CategorySkeleton() {
  const { t } = useLanguage()

  return (
    <Section spacing="md">
      <Container>
        <span className="sr-only">{t('state.loading')}</span>

        <div aria-hidden="true" className="animate-pulse">
          <div className="h-3 w-56 bg-surface" />
          <div className="mt-10 h-3 w-24 bg-surface" />
          <div className="mt-5 h-12 w-2/3 bg-surface md:h-16" />
          <div className="mt-12 aspect-[21/9] w-full bg-surface" />
          {/* One non-wrapping row, matching the browse row it stands in for —
              a wrapping skeleton would reserve several rows of height and the
              page would jump upward when the real single row replaced it. */}
          <div className="mt-12 flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-11 w-32 shrink-0 bg-surface" />
            ))}
          </div>
        </div>

        <SkeletonGrid className="mt-16" />
      </Container>
    </Section>
  )
}
