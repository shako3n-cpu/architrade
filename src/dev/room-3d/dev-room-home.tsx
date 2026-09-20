import { Home } from '@/pages/home'
import RoomHomeHero from './home-hero'
import { webglSupport } from './webgl-support'

/**
 * The real home page with the 3D room in place of the photograph hero —
 * the isolated page for working on the room, at /:lang/dev/room.
 *
 * It renders the same hero package the home page itself now shows on this
 * branch (see preview-hero.tsx), but WITHOUT the photograph behind it: here a
 * failure should be stated, not quietly papered over. That is the point of
 * having this page.
 *
 * Stated, though — not silent. A browser that cannot give the page a WebGL2
 * context leaves a canvas of the right size drawing nothing, with every asset
 * loaded and not one line in the console, which reads exactly like a broken
 * scene. So that one case is checked for and said out loud.
 *
 * On main this module is absent from the production build altogether:
 * App.tsx imports it behind `import.meta.env.DEV`, which Vite replaces with
 * `false` when building, so the import — and three.js with it — is removed as
 * dead code rather than merely unreachable.
 */
export default function DevRoomHome() {
  const webgl = webglSupport()

  if (!webgl.ok) {
    return (
      <Home
        hero={
          <section style={{ padding: '6rem 1.5rem', maxWidth: '44rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
              The room cannot be drawn here
            </p>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.5, marginTop: '0.75rem' }}>{webgl.reason}</p>
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>
              Nothing is wrong with the page: the home page falls back to its photograph in this case, and this
              development page says so instead.
            </p>
          </section>
        }
      />
    )
  }

  return <Home hero={<RoomHomeHero />} />
}
