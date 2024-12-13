import kamasIcon from '@/assets/kamas.webp'
import xpIcon from '@/assets/xp.webp'
import { getLang } from '@/lib/conf.ts'
import { almanaxQuery } from '@/queries/almanax.query'
import { confQuery } from '@/queries/conf.query'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'
import { DownloadImage } from './download-image'

export function AlmanaxFrame() {
  const conf = useSuspenseQuery(confQuery)
  const almanax = useQuery(almanaxQuery(getLang(conf.data.lang)))

  return (
    <div className="scroller relative z-10 mx-1 flex h-[9.5rem] items-center justify-center overflow-y-auto rounded-md border-2 border-blue-100/80 bg-secondary text-secondary-foreground">
      {almanax.isLoading && <LoaderIcon className="size-8 animate-spin text-blue-400 duration-1000" />}
      {almanax.isSuccess && (
        <div className="flex h-full flex-col gap-2 px-2 py-1">
          <div className="flex items-center justify-around text-sm xs:text-lg">
            <div className="font-semibold text-blue-300">Almanax</div>
            <span>Lvl: 200</span>
          </div>
          <div className="flex justify-center gap-2">
            {almanax.data.img && (
              <DownloadImage src={almanax.data.img} className="mr-0 size-10" loaderClassName="p-2 text-yellow-300" />
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 text-center text-xxs xs:text-xs">
                {almanax.data.quantity.toLocaleString()}x{' '}
                <span className="line-clamp-1 font-semibold text-yellow-300" title={almanax.data.name}>
                  {almanax.data.name}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <img src={xpIcon} className="h-3 select-none" draggable={false} />
                  <span>{almanax.data.experience.toLocaleString()} </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <img src={kamasIcon} className="h-3 select-none" draggable={false} />
                  <span>{almanax.data.kamas.toLocaleString()} </span>
                </div>
              </div>
            </div>
          </div>
          <div className="prose-sm text-center text-xxs" dangerouslySetInnerHTML={{ __html: almanax.data.bonus }} />
        </div>
      )}
    </div>
  )
}
