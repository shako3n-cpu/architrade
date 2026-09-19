import { BrandsStrip } from './brands-strip'
import { RoomHero } from './room-hero'

/**
 * The room hero as the home page takes it: the stage itself and the brands
 * strip under it. One definition, used by both the real home page (through
 * <PreviewRoomHero>, which is what guards it) and the isolated /dev/room
 * page, so the two can never drift apart.
 *
 * Everything three touches hangs off this module, and nothing imports it
 * except through a dynamic import — which is what keeps the 3D out of the
 * chunk the rest of the site loads.
 */
export default function RoomHomeHero() {
  return (
    <>
      <RoomHero />
      <BrandsStrip />
    </>
  )
}
