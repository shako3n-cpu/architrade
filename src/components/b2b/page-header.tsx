import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'

/**
 * The opening band of an interior page.
 *
 * NO PHOTOGRAPH, deliberately. The home page leads with a building because it
 * has one argument to make and one chance to make it. An interior page has
 * already been chosen from the navigation, and putting a second full-bleed
 * hero on every one of them turns the device into wallpaper — by the third
 * page nobody sees the picture. Type on the page tone, with the hairline
 * underneath doing the separating, is enough.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="border-b border-hairline pt-14 pb-16 md:pt-20 md:pb-24">
      <Container>
        <Eyebrow className="text-brass">{eyebrow}</Eyebrow>

        <h1 className="mt-5 max-w-4xl text-3xl text-ink sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          {description}
        </p>
      </Container>
    </div>
  )
}
