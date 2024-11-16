import { Button } from '@/components/ui/button.tsx'
import { CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { getGuideById, isGuideNew } from '@/lib/guide.ts'
import { cn } from '@/lib/utils.ts'
import { useDownloadGuideFromServer } from '@/mutations/download-guide-from-server.mutation.ts'
import { guidesFromServerQuery } from '@/queries/guides-from-server.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Guide } from '@/types/guide.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import * as Flag from 'country-flag-icons/react/3x2'
import { CircleAlertIcon, CircleCheckIcon, ImportIcon, LoaderIcon, VerifiedIcon } from 'lucide-react'
import { fromPromise } from 'neverthrow'
import { ComponentProps } from 'react'

function FlagPerLang({ lang }: { lang: string }) {
  switch (lang) {
    case 'fr':
      return <Flag.FR className="size-5" />
    case 'en':
      return <Flag.US className="size-5" />
    case 'de':
      return <Flag.DE className="size-5" />
    case 'es':
      return <Flag.ES className="size-5" />
    case 'it':
      return <Flag.IT className="size-5" />
    case 'pt':
      return <Flag.PT className="size-5" />
    default:
      return <Flag.FR />
  }
}

export function GuideCardHeader({
  guide,
}: {
  guide: Pick<Guide, 'name' | 'user' | 'id' | 'lang'> & { downloads?: Guide['downloads'] | null }
}) {
  return (
    <>
      <CardHeader className="p-3">
        <CardTitle className="leading-5">{guide.name}</CardTitle>
        <CardDescription className="flex items-start justify-between gap-2" asChild>
          <div>
            <div>
              <FlagPerLang lang={guide.lang} />
              <span>id: {guide.id}</span>
            </div>
            <span className="flex items-center gap-1">
              <span>
                de: <span className="font-semibold text-blue-400">{guide.user.name}</span>
              </span>
              {guide.user.is_certified === 1 && <VerifiedIcon className="size-4 text-orange-300" />}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
    </>
  )
}

export function GuideCardFooter({ className, children, ...props }: ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className={cn('gap-x-2 p-3 pt-0', className)} {...props}>
      {children}
    </CardFooter>
  )
}

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
  const downloads = useSuspenseQuery(guidesQuery)
  const downloadGuideFromServer = useDownloadGuideFromServer()

  const guideInServer = getGuideById(guides.data, guide.id)
  const guideInDownloads = getGuideById(downloads.data.guides, guide.id)

  // show a button to download the guide, checkmark if already downloaded, and alert icon if the guide has an update

  return (
    <>
      <Button
        size="icon"
        onClick={async () => {
          await fromPromise(downloadGuideFromServer.mutateAsync(guide), (err) => err)
        }}
        disabled={downloadGuideFromServer.isPending}
        className="relative"
        variant={downloadGuideFromServer.isError ? 'destructive' : 'secondary'}
      >
        {!downloadGuideFromServer.isPending &&
          (downloadGuideFromServer.isSuccess || guideInDownloads !== undefined) && <CircleCheckIcon />}
        {downloadGuideFromServer.isPending && <LoaderIcon className="animate-[spin_2s_linear_infinite]" />}
        {downloadGuideFromServer.isIdle && guideInDownloads === undefined && <ImportIcon />}
        {downloadGuideFromServer.isError && <CircleAlertIcon className="size-5" />}
        {isGuideNew(guideInServer, guideInDownloads) && (
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
