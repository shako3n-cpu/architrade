import { Home } from '@/pages/home'
import RoomHomeHero from './home-hero'

/**
 * The real home page with the 3D room in place of the photograph hero —
 * the isolated page for working on the room, at /:lang/dev/room.
 *
 * It renders the same hero package the home page itself now shows on this
 * branch (see preview-hero.tsx), but WITHOUT the fallback around it: here a
 * failure should be loud and visible, not quietly replaced by a photograph.
 * That is the point of having this page.
 *
 * On main this module is absent from the production build altogether:
 * App.tsx imports it behind `import.meta.env.DEV`, which Vite replaces with
 * `false` when building, so the import — and three.js with it — is removed as
 * dead code rather than merely unreachable.
 */
export default function DevRoomHome() {
  return <Home hero={<RoomHomeHero />} />
}
