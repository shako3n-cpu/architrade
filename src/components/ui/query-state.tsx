import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPABASE_CONFIG_BODY_KEY, SupabaseConfigError } from '@/lib/supabase'
import type { AsyncResult } from '@/hooks/use-async'
import { Button } from './button'
import { cn } from '@/lib/utils'

/**
 * The single place loading, error and empty states are drawn.
 *
 *   <QueryState result={products}>
 *     {(rows) => <Grid rows={rows} />}
 *   </QueryState>
 *
 * The children function only runs once data has actually arrived, so it never
 * has to check for null. An empty list is not an error — it gets its own
 * quiet state rather than an alarming one.
 */
export function QueryState<T>({
  result,
  children,
  skeleton,
  isEmpty,
  emptyTitle,
  emptyBody,
}: {
  result: AsyncResult<T>
  children: (data: T) => ReactNode
  /** Shown while loading. A grid of grey boxes reads better than a spinner. */
  skeleton?: ReactNode
  /** Decides whether the loaded data counts as empty. */
  isEmpty?: (data: T) => boolean
  emptyTitle?: string
  emptyBody?: string
}) {
  const { t } = useTranslation()
  const { data, status, error, retry } = result

  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">{t('state.loading')}</span>
        {skeleton ?? <SkeletonGrid />}
      </div>
    )
  }

  if (status === 'error') {
    // Missing keys are a configuration mistake, not a network problem — saying
    // so saves someone half an hour of checking their wifi.
    const misconfigured = error instanceof SupabaseConfigError

    return (
      <Message
        title={t(misconfigured ? 'state.notConfiguredTitle' : 'state.errorTitle')}
        body={t(misconfigured ? SUPABASE_CONFIG_BODY_KEY : 'state.errorBody')}
        detail={error?.message}
        action={
          misconfigured ? null : (
            <Button variant="outline" size="sm" onClick={retry}>
              {t('state.retry')}
            </Button>
          )
        }
      />
    )
  }

  if (data === null || (isEmpty && isEmpty(data))) {
    return <Message title={emptyTitle ?? t('state.emptyTitle')} body={emptyBody ?? t('state.emptyBody')} />
  }

  return <>{children(data)}</>
}

/** Placeholder boxes in the shape of the grid that is about to replace them. */
export function SkeletonGrid({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4', className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/3] bg-surface" />
          <div className="mt-5 h-4 w-3/4 bg-surface" />
          <div className="mt-3 h-3 w-1/2 bg-surface" />
        </div>
      ))}
    </div>
  )
}

/** Centred hairline-bounded panel used for both the error and empty states. */
function Message({
  title,
  body,
  detail,
  action,
}: {
  title: string
  body: string
  detail?: string
  action?: ReactNode
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center border-t border-b border-hairline px-6 py-20 text-center"
    >
      <h3 className="font-heading text-2xl text-ink">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{body}</p>

      {/* The raw message helps whoever is fixing it; visitors can ignore it. */}
      {detail && <p className="mt-4 max-w-lg font-mono text-xs break-words text-muted/70">{detail}</p>}

      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}
