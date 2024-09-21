import { Button } from '@/components/ui/button.tsx'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { getGuideById, isGuideNew } from '@/lib/guide.ts'
import { cn } from '@/lib/utils.ts'
import { useDownloadGuide } from '@/mutations/set-downloaded-guides.mutation.ts'
import { availableGuidesQuery } from '@/queries/available-guides.query.ts'
import { downloadsQuery } from '@/queries/downloads.query.ts'
import { Guide } from '@/types/guide.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { DownloadIcon, VerifiedIcon } from 'lucide-react'
import { fromPromise } from 'neverthrow'
import { ComponentProps } from 'react'

export function GuideCardHeader({
  guide,
}: {
  guide: Pick<Guide, 'name' | 'user' | 'id'> & { downloads?: Guide['downloads'] | null }
}) {
  return (
    <>
      <CardHeader className="p-3">
        <CardTitle className="leading-5">{guide.name}</CardTitle>
        <CardDescription className="flex justify-between gap-2">
          <span>id: {guide.id}</span>
          <span className="flex items-center gap-1">
            <span>
              de: <span className="font-semibold text-blue-600">{guide.user.name}</span>
            </span>
            {guide.user.is_certified && <VerifiedIcon className="size-4 text-orange-300" />}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3">{guide.downloads != null && <p>{guide.downloads}</p>}</CardContent>
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
    availableGuidesQuery({
      status: guide.status,
      page: 1,
    }),
  )
  const downloads = useSuspenseQuery(downloadsQuery)
  const downloadGuide = useDownloadGuide()

  return (
    <>
      <Button
        size="icon"
        onClick={async () => {
          await fromPromise(downloadGuide.mutateAsync(guide), (err) => err)
        }}
      >
        <DownloadIcon className="size-4" />
      </Button>
      {isGuideNew(
        getGuideById(guides.data.data, guide.id),
        getGuideById(downloads.data.downloaded_guides, guide.id),
      ) && <span>MAJ disponible</span>}
    </>
  )
}
