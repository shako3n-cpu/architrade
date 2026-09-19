import { Home } from '@/pages/home'
import { BrandsStrip } from './brands-strip'
import { RoomHero } from './room-hero'

/**
 * The real home page with the 3D room in place of the photograph hero.
 *
 * DEV ONLY. Reached at /:lang/dev/room when running `npm run dev`, linked from
 * nowhere, and absent from the production build: App.tsx imports this module
 * behind `import.meta.env.DEV`, which Vite replaces with `false` when
 * building, so the import — and three.js with it — is removed as dead code
 * rather than merely unreachable. Check with `npm run build` and a search of
 * dist/ for "WebGLRenderer": there should be no match.
 */
export default function DevRoomHome() {
  return (
    <Home
      hero={
        <>
          <RoomHero />
          <BrandsStrip />
        </>
      }
    />
  )
}
