import type { RoomId } from './room-types'

/**
 * The handoff between the 3D scene and the hotspot overlay.
 *
 * The dots and cards are ordinary DOM, outside the canvas — so they are real
 * buttons and real links, inside the router and the i18n like the rest of
 * the page. The scene only tells them where to be: each frame it publishes
 * which room's dots may show and how visible they are, projects each
 * registered dot's 3D anchor to the canvas, and moves the element there
 * directly. No React state per frame.
 *
 *   room    the room whose dots may show; null when none may
 *   alpha   0..1 — dots show only once a room has finished arriving, and go
 *           the moment it starts to leave
 */
export class HotspotStore {
  room: RoomId | null = null
  alpha = 0
  readonly #elements = new Map<string, HTMLElement>()

  /** Called by the scene each frame. */
  publish(room: RoomId | null, alpha: number) {
    this.room = room
    this.alpha = alpha
  }

  /** Called by the overlay for each dot it draws. Returns the unregister. */
  register(id: string, element: HTMLElement) {
    this.#elements.set(id, element)
    return () => {
      if (this.#elements.get(id) === element) this.#elements.delete(id)
    }
  }

  /** The ids of every dot currently drawn. */
  ids() {
    return this.#elements.keys()
  }

  /** Put a dot at canvas pixel (x, y), at `alpha`; hidden — and untabbable — when faint. */
  place(id: string, x: number, y: number, alpha: number) {
    const element = this.#elements.get(id)
    if (!element) return
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    element.style.opacity = alpha.toFixed(3)
    element.style.visibility = alpha > 0.02 ? 'visible' : 'hidden'
  }
}
