import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { QueryState } from '@/components/ui/query-state'
import { BrandManager } from '@/components/admin/brand-manager'
import { fetchAllBrands } from '@/lib/admin-queries'
import { useAsync } from '@/hooks/use-async'

/**
 * /admin/brands — the partner manufacturers.
 *
 * WHY THIS SCREEN EXISTS AT ALL
 *   The twenty-nine houses were a hardcoded array in src/data/company.ts, and
 *   two fields on every one of them — the website and the description — had
 *   been empty since the page was built. Not an oversight: both are facts only
 *   the office holds, and neither could be supplied without a developer
 *   editing TypeScript and shipping a build. This screen is the whole answer
 *   to that, and the row list says which houses are still missing a website so
 *   the work has a visible end.
 *
 * IT READS EVERYTHING, INCLUDING WHAT THE SITE HIDES
 *   `fetchAllBrands` rather than the public `fetchBrands`: the public one
 *   filters on `is_active`, which is right for the site and useless here,
 *   because the entire point of hiding a house is that somebody can still find
 *   it and bring it back.
 *
 * OPEN TO OPERATORS, like the category tree and unlike the staff screen. The
 * database agrees — supabase-brands.sql grants insert, update and delete to
 * `is_staff()`, not `is_admin()` — so there is no admin-only gate here to
 * contradict it.
 */
export function AdminBrands() {
  const { t } = useTranslation()
  const brands = useAsync(
    useCallback((signal: AbortSignal) => fetchAllBrands(signal), []),
    [],
  )

  return (
    <>
      <div>
        <h1 className="font-heading text-3xl text-ink">{t('admin.brandsTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t('admin.brandsSubtitle')}</p>
      </div>

      <QueryState result={brands}>
        {(rows) => <BrandManager brands={rows} onChanged={brands.retry} />}
      </QueryState>
    </>
  )
}
