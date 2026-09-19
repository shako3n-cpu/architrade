import type { CSSProperties } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { FABRICS, FLOORS, WALLS, type Finish } from './finishes'
import type { RoomId } from './room-types'

/**
 * The swatch row under the room switch: the room's main fabric, the walls and
 * the floor, four swatches each. Each group is a labelled group of toggle
 * buttons, one pressed; each swatch has its option's name as its accessible
 * name and tooltip. Choosing one fades the room to it (see <Finishes>).
 *
 * The fabric group is named for what it upholsters in THIS room — the sofa,
 * the stools, the bed, the chair.
 */
export function FinishControls({
  room,
  finish,
  onChange,
}: {
  room: RoomId
  finish: Finish
  onChange: (next: Partial<Finish>) => void
}) {
  const { t } = useLanguage()

  const groups = [
    {
      key: 'fabric' as const,
      label: t(`room3d.finish.fabric.${room}`),
      value: finish.fabric,
      options: FABRICS,
      pick: (id: string) => onChange({ fabric: id as Finish['fabric'] }),
    },
    {
      key: 'wall' as const,
      label: t('room3d.finish.walls'),
      value: finish.wall,
      options: WALLS,
      pick: (id: string) => onChange({ wall: id as Finish['wall'] }),
    },
    {
      key: 'floor' as const,
      label: t('room3d.finish.floor'),
      value: finish.floor,
      options: FLOORS,
      pick: (id: string) => onChange({ floor: id as Finish['floor'] }),
    },
  ]

  return (
    <div className="room3d-finishes" role="group" aria-label={t('room3d.finish.title')}>
      {groups.map((group) => (
        <div key={group.key} className="room3d-finish" role="group" aria-label={group.label}>
          <p className="room3d-finish-label" aria-hidden="true">
            {group.label}
          </p>
          <div className="room3d-swatches">
            {group.options.map((option) => {
              const name = t(`room3d.finish.option.${group.key}.${option.id}`)
              return (
                <button
                  key={option.id}
                  type="button"
                  className="room3d-swatch"
                  data-kind={group.key}
                  aria-pressed={group.value === option.id}
                  aria-label={name}
                  title={name}
                  style={{ '--swatch': option.swatch } as CSSProperties}
                  onClick={() => group.pick(option.id)}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
