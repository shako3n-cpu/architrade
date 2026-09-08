import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { QueryState, SkeletonGrid } from '@/components/ui/query-state'
import { ProductCard } from '@/components/catalog/product-card'
import { ContactBand } from '@/components/home/contact-band'
import { Button } from '@/components/ui/button'
import { useCatalogue } from '@/hooks/use-catalog'
import { useFavorites } from '@/hooks/use-favorites'
import { useLanguage } from '@/hooks/use-language'

/**
 * /favorites — the pieces this browser has kept.
 *
 * IT READS THE WHOLE CATALOGUE AND FILTERS IT
 *   Rather than fetching by slug. The catalogue is one request that most
 *   visitors have already made and that the hook caches, and the alternative
 *   is a query with a variable-length `in` list that grows with the shortlist.
 *   At two hundred products this is the right trade; at twenty thousand it
 *   would not be.
 *
 * A SAVED PIECE THAT NO LONGER EXISTS SIMPLY IS NOT HERE
 *   Archived, deleted, or renamed — the slug stops matching and the row drops
 *   out with no announcement. A specifier does not need a headstone for a sofa
 *   that has been discontinued; they need the list to be true. The count in
 *   the header follows the stored list rather than the resolved one, so it can
 *   briefly disagree, which is a smaller lie than a permanent gravestone.
 */
export function Favorites() {
  const { t, localePath } = useLanguage()
  const catalogue = useCatalogue()
  const { slugs, count, clear } = useFavorites()

  return (
    <>
      <Section>
        <Container>
          <Eyebrow>{t('favorites.eyebrow')}</Eyebrow>
          <h1 className="mt-4 font-heading text-4xl text-ink sm:text-5xl">
            {t('favorites.title')}
          </h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
            {t('favorites.intro')}
          </p>

          {count === 0 ? (
            <div className="mt-12 border-t border-b border-hairline py-16 text-center">
              <p className="text-sm text-muted">{t('favorites.emptyBody')}</p>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link to={localePath('/catalog')}>{t('favorites.emptyAction')}</Link>
              </Button>
            </div>
          ) : (
            <QueryState
              result={catalogue}
              skeleton={<SkeletonGrid count={4} className="lg:grid-cols-4" />}
            >
              {({ products, categories }) => {
                /*
                 * Ordered by the SHORTLIST, not by the catalogue. The list is
                 * kept newest-first, and a page that silently reordered it into
                 * catalogue order would lose the one piece of information the
                 * visitor put there: what they were looking at last.
                 */
                const byId = new Map(categories.map((category) => [category.id, category]))
                const bySlug = new Map(products.map((product) => [product.slug, product]))
                const kept = slugs
                  .map((slug) => bySlug.get(slug))
                  .filter((product) => product !== undefined)

                if (kept.length === 0) {
                  return (
                    <p className="mt-12 border-t border-b border-hairline py-16 text-center text-sm text-muted">
                      {t('favorites.allGoneBody')}
                    </p>
                  )
                }

                return (
                  <>
                    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
                      {kept.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          category={product.category_id ? byId.get(product.category_id) : undefined}
                        />
                      ))}
                    </div>

                    <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
                      <p className="text-xs text-muted">
                        {t('favorites.savedHere', { count: kept.length })}
                      </p>
                      <Button variant="outline" size="sm" className="ml-auto" onClick={clear}>
                        {t('favorites.clear')}
                      </Button>
                    </div>
                  </>
                )
              }}
            </QueryState>
          )}
        </Container>
      </Section>

      <ContactBand />
    </>
  )
}
