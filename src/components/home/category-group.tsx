import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Media } from '@/components/ui/media'
import { useLanguage } from '@/hooks/use-language'
import type { Category, Product } from '@/data/types'
import { buildCategoryTree, publicTree } from '@/lib/category-tree'
import { categoryImage, categoryImageAlt, categoryTitle } from '@/lib/localize'

/**
 * One half of the catalogue — home furniture or office furniture — as a row of
 * category cards.
 *
 * Both halves are rendered on the page rather than hidden behind tabs. A tab
 * would hide half the catalogue from anyone who never clicks it, and from a
 * crawler entirely; the hero's two buttons jump straight to the right block
 * instead, which is the same convenience without the cost.
 */
export function CategoryGroupSection({
  id,
  eyebrow,
  title,
  description,
  categories,
  products,
}: {
  /** Anchor target for the matching hero button. */
  id: string
  eyebrow: string
  title: string
  description: string
  categories: Category[]
  /** Used only to count how many pieces sit in each category. */
  products: Product[]
}) {
  const { lang, localePath, t } = useLanguage()

  /*
   * TOP-LEVEL BRANCHES ONLY.
   *
   * This used to render whatever list it was handed, which was the entire
   * table. That was correct while the table was six flat rows; against the
   * tree it puts all twenty-nine on the home page — leaves next to their own
   * parents, and the hidden branches too. The home page's job is to name the
   * four or five doors into the catalogue, so it takes the roots of the
   * public tree and lets the mega menu and the category pages carry the rest.
   *
   * The count on each card is `totalCount`, so a parent reports what is
   * underneath it rather than the nothing filed directly on it.
   */
  const branches = publicTree(buildCategoryTree(categories, products))

  return (
    /*
     * On `surface`, not on the page paper, and with no top hairline.
     *
     * This band and the featured row below it are both "catalogue things in a
     * grid". Rendered on the same ground with the same rule above them they
     * read as one very long grid with a heading dropped into the middle of it,
     * which is the flatness the page had. A change of ground separates them
     * more quietly than another hairline would, and the colour change already
     * does the work the border was doing.
     */
    <Section id={id} spacing="lg" className="bg-surface" aria-labelledby={`${id}-title`}>
      <Container>
        <SectionHeading
          id={`${id}-title`}
          as="h2"
          size="h3"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {/* Rendered even when empty, so the hero button that points at this
            anchor always lands somewhere. An empty office half means the
            database has not had supabase-schema.sql run against it yet. */}
        {branches.length === 0 && (
          <p className="mt-10 text-sm text-muted">{t('home.groupEmpty')}</p>
        )}

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map(({ category, totalCount: count }) => {
            const image = categoryImage(category)

            return (
              <Link
                key={category.id}
                to={localePath(`/catalog/${category.slug}`)}
                className="group flex flex-col"
              >
                {image ? (
                  <Media
                    src={image}
                    alt={categoryImageAlt(category, lang)}
                    ratio="landscape"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    zoom
                  />
                ) : (
                  // No photograph on the row yet — a quiet box, never a broken
                  // image icon. Run supabase-schema.sql to fill these in.
                  <div aria-hidden="true" className="aspect-[4/3] bg-surface" />
                )}

                <div className="mt-5 flex items-start justify-between gap-4 border-t border-hairline pt-5">
                  <div>
                    <h3 className="font-heading text-xl text-ink transition-colors duration-300 group-hover:text-brass">
                      {categoryTitle(category, lang)}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted">
                      {t('catalog.resultCount', { count })}
                    </p>
                  </div>

                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 stroke-[1.25] text-muted transition-colors duration-300 group-hover:text-brass"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
