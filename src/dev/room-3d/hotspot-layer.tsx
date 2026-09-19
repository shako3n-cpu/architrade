import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, X } from 'lucide-react'
import type { Brand, Product } from '@/data/types'
import { useLanguage } from '@/hooks/use-language'
import { productDescription, productTitle } from '@/lib/localize'
import { fetchBrands, fetchProductsBySlugs } from '@/lib/queries'
import type { HotspotStore } from './hotspot-store'
import { HOTSPOT_SLUGS, HOTSPOTS, type Hotspot } from './hotspots'
import type { RoomId } from './room-types'

/**
 * ============================================================================
 * PRODUCT HOTSPOTS — THE OVERLAY
 * ----------------------------------------------------------------------------
 * A pulsing gold dot on each key piece (hotspots.ts). Click, tap, Enter or
 * Space opens a small card beside it: brand, model, one line, and a link into
 * the catalog. Esc, a click anywhere else, or the dot again closes it.
 *
 * The dots are real <button>s in the page's DOM, laid over the canvas; the
 * scene moves them each frame to where their piece is on screen, and hides
 * them until the room has finished arriving (see hotspot-store.ts). Hidden
 * with `visibility`, so a dot that cannot be seen cannot be tabbed to either.
 * The overlay itself lets pointer events through, so a drag that starts
 * anywhere but on a dot still turns the room.
 *
 * The card's text is the live catalog's, fetched once for every room — see
 * hotspots.ts for which products, and for what a TODO placeholder means.
 * ============================================================================
 */

type CatalogState = {
  status: 'loading' | 'ready' | 'error'
  products: Map<string, Product>
  brands: Map<string, Brand>
}

/** Every hotspot product and every brand, once, for as long as the hero is up. */
function useHotspotCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ status: 'loading', products: new Map(), brands: new Map() })

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([fetchProductsBySlugs(HOTSPOT_SLUGS, controller.signal), fetchBrands(controller.signal)]).then(
      ([products, brands]) =>
        setState({
          status: 'ready',
          products: new Map(products.map((p) => [p.slug, p])),
          brands: new Map(brands.map((b) => [b.id, b])),
        }),
      () => {
        if (!controller.signal.aborted) setState((s) => ({ ...s, status: 'error' }))
      },
    )
    return () => controller.abort()
  }, [])

  return state
}

/** The first sentence of a description — the card has room for one line. */
function firstSentence(text: string): string {
  const match = text.trim().match(/^.*?[.!?։](\s|$)/)
  return (match ? match[0] : text).trim()
}

/**
 * Where an open card sits. Beside its dot, on the side with room, when the
 * stage is wide. On a narrow stage — a phone — there is no side with room,
 * and no room above or below either: the stage is ~365px tall and a card
 * ~190, so a card beside, over or under a dot in the middle ran off the
 * stage and was clipped. There it is a SHEET across the bottom of the stage,
 * over the Replay row, with its dot left highlighted.
 */
type Open = {
  room: RoomId
  id: string
  side: 'left' | 'right' | 'sheet'
  vertical: 'up' | 'middle' | 'down'
}

/** Below this stage width a card is a sheet rather than sitting beside its dot. */
const NARROW = 620

export function HotspotLayer({ room, store }: { room: RoomId; store: HotspotStore }) {
  const catalog = useHotspotCatalog()
  const layer = useRef<HTMLDivElement>(null)

  // Keyed by room, so a card left open simply stops matching when the room
  // changes — closed without an effect.
  const [openState, setOpenState] = useState<Open | null>(null)
  const open = openState?.room === room ? openState : null

  const close = useCallback((refocus: boolean) => {
    setOpenState((current) => {
      if (current && refocus) {
        layer.current?.querySelector<HTMLButtonElement>(`[data-hotspot-dot="${current.id}"]`)?.focus()
      }
      return null
    })
  }, [])

  /** Open beside the dot, on whichever side has room — decided from where it is now. */
  const toggle = useCallback(
    (id: string, anchor: HTMLElement) => {
      setOpenState((current) => {
        if (current?.room === room && current.id === id) return null
        const box = layer.current?.getBoundingClientRect()
        const at = anchor.getBoundingClientRect()
        if (!box) return { room, id, side: 'right', vertical: 'middle' }
        const x = (at.left - box.left) / box.width
        const y = (at.top - box.top) / box.height

        if (box.width < NARROW) return { room, id, side: 'sheet', vertical: 'middle' }
        return {
          room,
          id,
          side: x > 0.58 ? 'left' : 'right',
          vertical: y < 0.28 ? 'down' : y > 0.66 ? 'up' : 'middle',
        }
      })
    },
    [room],
  )

  // Esc and outside clicks, only while a card is open.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node
      const owner = layer.current?.querySelector(`[data-hotspot="${open.id}"]`)
      const sheet = layer.current?.querySelector('.room3d-card[data-side="sheet"]')
      if (owner && !owner.contains(target) && !sheet?.contains(target)) close(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, close])

  return (
    <div ref={layer} className="room3d-hotspots">
      {HOTSPOTS[room].map((hotspot) => (
        <HotspotDot
          key={hotspot.id}
          hotspot={hotspot}
          store={store}
          open={open?.id === hotspot.id ? open : null}
          onToggle={toggle}
          onClose={close}
          catalog={catalog}
        />
      ))}

      {open?.side === 'sheet' &&
        (() => {
          const hotspot = HOTSPOTS[room].find((h) => h.id === open.id)
          return hotspot ? <SheetCard hotspot={hotspot} open={open} catalog={catalog} onClose={close} /> : null
        })()}
    </div>
  )
}

/** The narrow-stage card, with focus moved into it — it is not next to its dot in the tab order. */
function SheetCard({
  hotspot,
  open,
  catalog,
  onClose,
}: {
  hotspot: Hotspot
  open: Open
  catalog: CatalogState
  onClose: (refocus: boolean) => void
}) {
  const { t } = useLanguage()
  return (
    <HotspotCard
      id={`room3d-card-${hotspot.id}`}
      hotspot={hotspot}
      name={t(`room3d.item.${hotspot.item}`)}
      open={open}
      catalog={catalog}
      onClose={onClose}
      autoFocus
    />
  )
}

function HotspotDot({
  hotspot,
  store,
  open,
  onToggle,
  onClose,
  catalog,
}: {
  hotspot: Hotspot
  store: HotspotStore
  open: Open | null
  onToggle: (id: string, anchor: HTMLElement) => void
  onClose: (refocus: boolean) => void
  catalog: CatalogState
}) {
  const { t } = useLanguage()
  const anchor = useRef<HTMLDivElement>(null)
  const cardId = `room3d-card-${hotspot.id}`
  const name = t(`room3d.item.${hotspot.item}`)

  // Registered for the scene to move; starts hidden until the scene says otherwise.
  useLayoutEffect(() => {
    const element = anchor.current
    if (!element) return
    return store.register(hotspot.id, element)
  }, [store, hotspot.id])

  return (
    <div ref={anchor} className="room3d-hotspot" data-hotspot={hotspot.id} style={{ visibility: 'hidden', opacity: 0 }}>
      <button
        type="button"
        className="room3d-hotspot-dot"
        data-hotspot-dot={hotspot.id}
        aria-label={t('room3d.hotspot.open', { item: name })}
        aria-expanded={open !== null}
        aria-controls={open ? cardId : undefined}
        onClick={() => anchor.current && onToggle(hotspot.id, anchor.current)}
      >
        <span className="room3d-hotspot-pulse" aria-hidden="true" />
        <span className="room3d-hotspot-label" aria-hidden="true">
          {name}
        </span>
      </button>

      {open && open.side !== 'sheet' && (
        <HotspotCard id={cardId} hotspot={hotspot} name={name} open={open} catalog={catalog} onClose={onClose} />
      )}
    </div>
  )
}

function HotspotCard({
  id,
  hotspot,
  name,
  open,
  catalog,
  onClose,
  autoFocus = false,
}: {
  id: string
  hotspot: Hotspot
  name: string
  open: Open
  catalog: CatalogState
  onClose: (refocus: boolean) => void
  autoFocus?: boolean
}) {
  const { t, lang, localePath } = useLanguage()
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (autoFocus) closeButton.current?.focus()
  }, [autoFocus])
  const titleId = `${id}-title`
  const product = hotspot.slug ? catalog.products.get(hotspot.slug) : undefined
  const brand = product?.brand_id ? catalog.brands.get(product.brand_id) : undefined
  const loading = hotspot.slug !== null && catalog.status === 'loading'

  /** A marked placeholder: visible as one, and read out as one. */
  const todo = (text: string) => (
    <span className="room3d-todo">
      <span className="room3d-todo-tag">{t('room3d.hotspot.todo')}</span> {text}
    </span>
  )

  return (
    <div
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      className="room3d-card"
      data-side={open.side}
      data-vertical={open.vertical}
    >
      <button
        ref={closeButton}
        type="button"
        className="room3d-card-close"
        aria-label={t('room3d.hotspot.close')}
        onClick={() => onClose(true)}
      >
        <X aria-hidden="true" />
      </button>

      {loading ? (
        <p className="room3d-card-line">{t('room3d.hotspot.loading')}</p>
      ) : (
        <>
          <p className="room3d-card-brand">{brand ? brand.name : todo(t('room3d.hotspot.brandTodo'))}</p>
          <p id={titleId} className="room3d-card-model">
            {product ? productTitle(product, lang) : name}
          </p>
          <p className="room3d-card-line">
            {product
              ? firstSentence(productDescription(product, lang))
              : // No slug: a placeholder by design. A slug that did not come
                // back: the product has been archived or removed since.
                todo(hotspot.slug ? t('room3d.hotspot.missingTodo') : t('room3d.hotspot.productTodo'))}
          </p>

          <Link className="room3d-card-link" to={localePath(product ? `/product/${product.slug}` : '/catalog')}>
            {product ? t('room3d.hotspot.viewInCatalog') : t('room3d.hotspot.browseCatalog')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </>
      )}
    </div>
  )
}
