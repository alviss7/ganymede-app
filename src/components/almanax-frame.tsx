import { almanaxQuery } from '@/queries/almanax.query'
import { useQuery } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'

export function AlmanaxFrame() {
  const almanax = useQuery(almanaxQuery)

  return (
    <div className="mx-4 flex grow items-center justify-center border p-2">
      {almanax.isLoading && <LoaderIcon className="size-8 text-blue-400" />}
      {almanax.isSuccess && (
        <div className="flex flex-col gap-0.5">
          <div className="text-center text-lg">Almanax LVL: 200</div>
          <div className="flex items-center justify-center gap-1 text-center text-xs">
            {almanax.data.img && <img src={almanax.data.img} className="size-6" />}
            <span>
              {almanax.data.quantity}x {almanax.data.name}
            </span>
          </div>
          <div className="text-center text-xs">{almanax.data.experience} EXP</div>
          <div className="text-center text-xs">{almanax.data.kamas} KAMAS</div>
          <div
            className="prose-sm text-center text-xs leading-4"
            dangerouslySetInnerHTML={{ __html: almanax.data.bonus }}
          />
        </div>
      )}
    </div>
  )
}
