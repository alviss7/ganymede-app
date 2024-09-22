import { confQuery } from '@/queries/conf.query.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

export function Position({
  pos_x,
  pos_y,
}: {
  pos_x: number
  pos_y: number
}) {
  const conf = useSuspenseQuery(confQuery)

  const onClick = async () => {
    let copy = `[${pos_x},${pos_y}]`

    if (conf.data.autoTravelCopy) {
      copy = `/travel ${pos_x},${pos_y}`
    }

    await writeText(copy)
  }

  return (
    <button className="w-20 text-start font-semibold text-yellow-400" onClick={onClick}>
      [{pos_x},{pos_y}]
    </button>
  )
}
