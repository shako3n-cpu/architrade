import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { FOUNDED_YEAR } from '@/config/site'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

/**
 * The first screen: a split rather than a photograph with text laid over it.
 *
 * Text sits on the off-white page and the photograph keeps its own half, so
 * the headline is readable no matter which image the client swaps in later —
 * an overlay would need a new scrim every time the photo changed.
 *
 * The two buttons are the whole navigation promise of the site: home
 * furniture or office furniture. They jump to the matching block below.
 */
export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="border-b border-hairline">
      <div className="mx-auto grid w-full max-w-[110rem] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-14 lg:py-28 xl:px-20">
          <Eyebrow className="text-brass">{t('home.heroEyebrow')}</Eyebrow>

          <h1 className="mt-6 font-heading text-[2.5rem] leading-[1.08] text-ink sm:text-5xl xl:text-[4rem]">
            {t('home.heroTitle')}
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {t('home.heroTagline')}
          </p>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            {t('home.heroSupport')}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="solid">
              <a href="#home-furniture">
                {t('home.heroHomeCta')}
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>

            <Button asChild variant="outline">
              <a href="#office-furniture">
                {t('home.heroOfficeCta')}
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-hairline pt-8 sm:grid-cols-3">
            <Stat
              className="col-span-2 sm:order-3 sm:col-span-1"
              value={t('home.statDeliveryValue')}
              label={t('home.statDelivery')}
            />
            <Stat value={String(FOUNDED_YEAR)} label={t('home.statFounded')} />
            <Stat value={t('home.statProjectsValue')} label={t('home.statProjects')} />
          </dl>
        </div>

        {/* Largest contentful paint on the page, so it loads eagerly and at
            high priority rather than waiting behind the lazy grid below. */}
        <div className="relative order-first min-h-[20rem] bg-surface sm:min-h-[26rem] lg:order-last lg:min-h-[44rem]">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=80"
            alt={t('home.heroImageAlt')}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

/** One figure in the hairline-topped row beneath the buttons. */
function Stat({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block whitespace-nowrap font-heading text-2xl text-ink">{value}</span>
        <span className="mt-1.5 block text-xs leading-snug text-muted">{label}</span>
      </dd>
    </div>
  )
}
