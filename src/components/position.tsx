import { confQuery } from '@/queries/conf.query.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { copyPosition } from '@/lib/copy-position'

export function Position({
  pos_x,
  pos_y,
}: {
  pos_x: number
  pos_y: number
}) {
  const conf = useSuspenseQuery(confQuery)

  const onClick = async () => {
    await copyPosition(pos_x, pos_y, conf.data.autoTravelCopy)
  }

  return (
    <button className="w-20 text-start text-yellow-400" onClick={onClick}>
      [{pos_x},{pos_y}]
    </button>
  )
}
