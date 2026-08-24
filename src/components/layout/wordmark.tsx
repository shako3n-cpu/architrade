import { Link } from 'react-router-dom'
import { useLanguage } from '@/hooks/use-language'
import { SITE_NAME } from '@/config/site'
import { cn } from '@/lib/utils'

/**
 * The ARCHTRADE wordmark. Set in the heading serif with wide tracking —
 * it is typography, not an image file, so it stays sharp at every size and
 * needs no alt text.
 */
export function Wordmark({ className }: { className?: string }) {
  const { localePath, t } = useLanguage()

  return (
    <Link
      to={localePath('/')}
      aria-label={t('header.homeLink')}
      className={cn(
        'font-heading text-xl leading-none tracking-[0.22em] text-ink',
        'transition-colors duration-300 hover:text-brass',
        className,
      )}
    >
      {SITE_NAME}
    </Link>
  )
}
