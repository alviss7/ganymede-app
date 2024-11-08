import { almanaxQuery } from '@/queries/almanax.query'
import { useQuery } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'
import kamasIcon from '@/assets/kamas.webp'
import xpIcon from '@/assets/xp.webp'

export function AlmanaxFrame() {
  const almanax = useQuery(almanaxQuery)

  return (
    <div className="mx-4 flex grow items-center justify-center rounded border p-2">
      {almanax.isLoading && <LoaderIcon className="size-8 text-blue-400" />}
      {almanax.isSuccess && (
        <div className="flex flex-col gap-0.5">
          <div className="text-center text-lg">Almanax LVL: 200</div>
          <div className="flex items-center justify-center gap-1 text-center text-xs">
            {almanax.data.img && <img src={almanax.data.img} className="size-6" />}
            <span>
              {almanax.data.quantity.toLocaleString()}x {almanax.data.name}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <img src={xpIcon} className="h-4 select-none" draggable={false} />
            <span>{almanax.data.experience.toLocaleString()} </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <img src={kamasIcon} className="h-4 select-none" draggable={false} />
            <span>{almanax.data.kamas.toLocaleString()} </span>
          </div>
          <div
            className="prose-sm text-center text-xs leading-4"
            dangerouslySetInnerHTML={{ __html: almanax.data.bonus }}
          />
        </div>
      )}
    </div>
  )
}
