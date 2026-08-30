import type { ReactNode } from 'react'
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
 * The row of sibling categories, so a visitor can move sideways through the
 * catalogue without going back to the index first.
 *
 * Driven by the categories table, so adding a category in Supabase adds it
 * here with no edit to this file.
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

  return (
    <nav aria-label={t('category.browseLabel')} className={className}>
      <Eyebrow as="p" className="mb-5 text-muted">
        {t('category.otherCategories')}
      </Eyebrow>

      <ul className="flex flex-wrap gap-2">
        <li>
          <Chip to={localePath('/catalog')}>{t('catalog.allProducts')}</Chip>
        </li>

        {categories.map((item) => (
          <li key={item.id}>
            <Chip to={localePath(`/catalog/${item.slug}`)} active={item.slug === activeSlug}>
              {categoryTitle(item, lang)}
            </Chip>
          </li>
        ))}
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
  // back to their natural height once there is a pointer.
  const classes =
    'inline-flex min-h-11 items-center border px-4 py-2 text-xs tracking-[0.12em] uppercase sm:min-h-0'

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
          <div className="mt-12 flex flex-wrap gap-2">
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="h-9 w-32 bg-surface" />
            ))}
          </div>
        </div>

        <SkeletonGrid className="mt-16" />
      </Container>
    </Section>
  )
}
