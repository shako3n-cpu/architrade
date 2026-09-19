import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { BRAND_COUNT_AT_SEED } from '@/data/company'
import { useBrands } from '@/hooks/use-catalog'
import { useLanguage } from '@/hooks/use-language'

/**
 * ============================================================================
 * THE BRANDS STRIP — directly under the hero
 * ----------------------------------------------------------------------------
 * One slim band: "29 manufacturers" and a link to the brand directory on the
 * left, and the houses' names drifting slowly past on the right. The names
 * and the count are the live brands table's (fetchBrands) — the same query
 * the brands page and the live hero use — with the seeded count standing in
 * for the single paint before it lands, as the live hero does.
 *
 * THE DRIFT
 *   The list is written twice, end to end, and the pair slides left by half
 *   its own width over a minute, then starts again — a loop with no seam.
 *   It pauses under the pointer and when a name has keyboard focus, and it
 *   does not move at all under reduced motion: there, the row scrolls
 *   sideways like any other.
 *
 *   The second copy is hidden from assistive technology and out of the tab
 *   order, so a screen reader hears each house once.
 * ============================================================================
 */
export function BrandsStrip() {
  const { t, localePath } = useLanguage()
  const brands = useBrands().data ?? []
  const count = brands.length || BRAND_COUNT_AT_SEED

  return (
    <section className="room3d-brands" aria-labelledby="room3d-brands-title">
      <Container className="room3d-brands-inner">
        <div className="room3d-brands-lead">
          <p id="room3d-brands-title" className="room3d-brands-count">
            {t('room3d.brands.count', { count })}
          </p>
          <Link to={localePath('/brands')} className="room3d-brands-all">
            {t('room3d.brands.all')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {brands.length > 0 && (
          <div className="room3d-marquee">
            <div className="room3d-marquee-track">
              {[0, 1].map((copy) => (
                <ul key={copy} className="room3d-marquee-list" aria-hidden={copy === 1 ? true : undefined}>
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <Link to={localePath('/brands')} tabIndex={copy === 1 ? -1 : undefined}>
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
