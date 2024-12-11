import { Button } from '@/components/ui/button.tsx'
import { getGuideById, isGuideNew } from '@/lib/guide.ts'
import { useDownloadGuideFromServer } from '@/mutations/download-guide-from-server.mutation.ts'
import { guidesFromServerQuery } from '@/queries/guides-from-server.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Guide } from '@/types/guide.ts'
import { t } from '@lingui/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CircleAlertIcon, CircleCheckIcon, ImportIcon, LoaderIcon } from 'lucide-react'
import { fromPromise } from 'neverthrow'

export function GuideDownloadButton({
  guide,
}: {
  guide: Pick<Guide, 'id' | 'status'>
}) {
  const guides = useSuspenseQuery(
    guidesFromServerQuery({
      status: guide.status,
    }),
  )
  const downloads = useSuspenseQuery(guidesQuery())
  const downloadGuideFromServer = useDownloadGuideFromServer()

  const guideInServer = getGuideById(guides.data, guide.id)
  const guideInDownloads = getGuideById(downloads.data, guide.id)

  const isGuideNeedUpdate = isGuideNew(guideInServer, guideInDownloads)

  // show a button to download the guide, checkmark if already downloaded, and alert icon if the guide has an update

  return (
    <>
      <Button
        size="icon"
        onClick={async () => {
          console.log(guideInDownloads)

          await fromPromise(
            downloadGuideFromServer.mutateAsync({ guide, folder: guideInDownloads?.folder ?? '' }),
            (err) => err,
          )
        }}
        disabled={downloadGuideFromServer.isPending}
        className="relative"
        variant={downloadGuideFromServer.isError ? 'destructive' : 'secondary'}
        title={isGuideNeedUpdate ? t`Mettre à jour le guide` : t`Télécharger le guide`}
      >
        {!downloadGuideFromServer.isPending &&
          (downloadGuideFromServer.isSuccess || guideInDownloads !== undefined) && <CircleCheckIcon />}
        {downloadGuideFromServer.isPending && <LoaderIcon className="animate-[spin_2s_linear_infinite]" />}
        {downloadGuideFromServer.isIdle && guideInDownloads === undefined && <ImportIcon />}
        {downloadGuideFromServer.isError && <CircleAlertIcon className="size-5" />}
        {isGuideNeedUpdate && (
          <span
            className="-right-2 -top-3.5 absolute size-4 font-black text-2xl text-yellow-400"
            title="Update available"
          >
            !
          </span>
        )}
      </Button>
    </>
  )
}
