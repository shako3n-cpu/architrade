import { Suspense, useRef, useState } from 'react'
import './i18n'
import { Link, useSearchParams } from 'react-router-dom'
import { Move3d, RotateCcw } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { HotspotStore } from './hotspot-store'
import { HotspotLayer } from './hotspot-layer'
import { RoomScene, type StageLayout } from './room-scene'
import { ROOM_IDS, type ArmchairMode, type RoomId } from './room-types'
import { useReducedMotion } from './use-reduced-motion'
import './room-3d.css'

/**
 * ============================================================================
 * THE 3D ROOM, AS THE HOME PAGE HERO
 * ----------------------------------------------------------------------------
 * Replaces the photograph hero on the dev-only /:lang/dev/room route. The
 * headline, standfirst and two calls to action are the real hero's own copy,
 * read from the same locale keys, so the comparison with the live home page
 * is like for like. The figures rail is not carried over: under a scene that
 * is already the busiest thing on the page it competed rather than informed.
 *
 * TWO LAYOUTS
 *   lg and up   the canvas is the whole hero; the copy sits over its left
 *               side and the room is framed to the right of it.
 *   below lg    copy first, then the room in its own portrait block. Laid
 *               over a phone-sized room, the headline covered the furniture
 *               and the furniture made the headline unreadable.
 *
 * The overlay copy is `pointer-events-none` so a drag that starts on the
 * headline still turns the room; the buttons opt back in.
 *
 * FOUR ROOMS
 *   Living room, kitchen, bedroom, office — the same shell furnished four
 *   ways (rooms.tsx). The switch sits under the calls to action, where on a
 *   phone it is also directly above the room it changes. It is the site's own
 *   filter chip (the brand directory's), so it reads as part of the page and
 *   every class it uses is one production already generates.
 *
 * STRINGS
 *   Every string is read with the site's t(), from `room3d.*` keys in
 *   English and Georgian — see i18n.ts for why those two files live in this
 *   folder rather than in src/locales. The Georgian is a first draft: have
 *   it checked before this ever leaves the preview branch.
 * ============================================================================
 */


const DEFAULT_ROOM = ROOM_IDS[0]

function readRoom(value: string | null): RoomId {
  return ROOM_IDS.find((id) => id === value) ?? DEFAULT_ROOM
}

/**
 * The armchair comparison that settled the living room's chair. Its switch
 * is gone from the stage — the room switch needed the space, and the Poly
 * Haven chair won — but the comparison is still one parameter away:
 * `?armchair=procedural` or `?armchair=polyhaven-raw`.
 */
const ARMCHAIR_MODES: ArmchairMode[] = ['polyhaven', 'procedural', 'polyhaven-raw']

function readArmchair(value: string | null): ArmchairMode {
  return ARMCHAIR_MODES.find((mode) => mode === value) ?? ARMCHAIR_MODES[0]
}

export function RoomHero() {
  const { t, localePath } = useLanguage()

  // Both in the address, so a room can be reloaded or sent to someone.
  const [params, setParams] = useSearchParams()
  const room = readRoom(params.get('room'))
  const armchair = readArmchair(params.get('armchair'))
  const reduced = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)

  const chooseRoom = (next: RoomId) => {
    setParams(
      (current) => {
        if (next === DEFAULT_ROOM) current.delete('room')
        else current.set('room', next)
        return current
      },
      { replace: true },
    )

    /*
     * Bring the room fully into view if it is not, so the change is seen.
     * Below lg the switch sits ABOVE the stage, and in a short window — a
     * phone, a browser pane beside something else — the room was partly
     * below the fold when the button was pressed: the whole clear-and-
     * refurnish played out where nobody could see it, and read as nothing
     * having happened. 'nearest' scrolls only as far as it must; the page's
     * scroll-padding keeps the stage clear of the sticky header.
     */
    const box = stage.current?.getBoundingClientRect()
    if (box && (box.bottom > window.innerHeight + 4 || box.top < 0)) {
      stage.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' })
    }
  }

  const wide = useMediaQuery('(min-width: 1024px)')
  const coarse = useMediaQuery('(pointer: coarse)')
  const layout: StageLayout = wide ? 'overlay' : 'stacked'

  const [replayToken, setReplayToken] = useState(0)

  // Shared by the scene, which writes where each hotspot dot is, and the
  // overlay, which draws them. Made once; never replaced.
  const [hotspots] = useState(() => new HotspotStore())

  return (
    // `room3d-*` classes are plain CSS in room-3d.css — see the note there.
    <section className="room3d-hero relative isolate flex flex-col overflow-hidden bg-surface">
      <Container className="room3d-copy relative z-10 pb-2">
        <div className="room3d-measure">
          <Eyebrow className="text-brass">{t('b2b.hero.eyebrow')}</Eyebrow>

          <h1 className="mt-5 text-3xl text-ink sm:text-4xl lg:text-5xl">{t('b2b.hero.title')}</h1>

          {/* Not on a phone. With it, the copy ran to 555px at 375 wide and the
              first screen showed only the top edge of the room — the one thing
              this hero exists to show. The headline and both actions stay. */}
          <p className="mt-6 hidden text-base leading-relaxed text-muted sm:block">
            {t('b2b.hero.descriptionShort')}
          </p>

          <div className="room3d-actions mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="w-full">
              <Link to={localePath('/catalog')}>{t('b2b.hero.ctaCatalog')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link to={localePath('/contact')}>{t('b2b.hero.ctaConsult')}</Link>
            </Button>
          </div>

          {/*
           * The room switch — the brand directory's filter chips, classes and
           * all. A row that scrolls sideways on a phone, as that one does,
           * rather than wrapping to two rows and pushing the room down.
           */}
          <div className="room3d-rooms mt-6" role="group" aria-label={t('room3d.rooms')}>
            <p className="at-label mb-3 hidden text-muted sm:block" aria-hidden="true">
              {t('room3d.rooms')}
            </p>
            <div className="at-scroll-row -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:gap-x-2 sm:gap-y-3 sm:overflow-visible sm:px-0">
              {ROOM_IDS.map((id) => {
                const active = room === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseRoom(id)}
                    aria-pressed={active}
                    className={cn(
                      'at-label min-h-11 shrink-0 border px-4 whitespace-nowrap transition-colors duration-300 sm:min-h-10',
                      active
                        ? 'border-brass bg-brass text-background'
                        : 'border-hairline text-muted hover:border-brass hover:text-brass',
                    )}
                  >
                    {t(`room3d.room.${id}`)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Container>

      {/*
       * The stage. A fixed share of the small viewport height below lg, so
       * the portrait frame is predictable, with a floor for short phones held
       * in landscape; the full hero from lg up.
       */}
      <div ref={stage} role="img" aria-label={t(`room3d.label.${room}`)} className="room3d-stage relative w-full">
        <Suspense fallback={null}>
          <RoomScene
            room={room}
            replayToken={replayToken}
            reduced={reduced}
            layout={layout}
            coarsePointer={coarse}
            armchair={armchair}
            hotspots={hotspots}
          />
        </Suspense>

        <HotspotLayer room={room} store={hotspots} />

        {/* Bottom LEFT, Replay first. The site's floating chat button is fixed
            to the bottom right of every page, and on the first layout it sat
            squarely on top of Replay. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <Container className="room3d-controls flex items-center gap-4">
            {/* Nothing to replay when the room is shown finished from the start. */}
            {!reduced && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="room3d-replay shrink-0 gap-2 backdrop-blur-sm"
                onClick={() => setReplayToken((token) => token + 1)}
              >
                <RotateCcw aria-hidden="true" className="size-4 stroke-[1.25]" />
                {t('room3d.replay')}
              </Button>
            )}

            <p className="flex items-center gap-2 text-xs text-muted">
              <Move3d aria-hidden="true" className="size-4 stroke-[1.25]" />
              {coarse ? t('room3d.hintTouch') : t('room3d.hint')}
            </p>
          </Container>
        </div>
      </div>
    </section>
  )
}
