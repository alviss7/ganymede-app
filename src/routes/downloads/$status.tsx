import { GenericLoader } from '@/components/generic-loader.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from '@/components/ui/pagination.tsx'
import { getGuideById, isGuideNew } from '@/lib/guide.ts'
import { useDownloadGuide } from '@/mutations/set-downloaded-guides.mutation.ts'
import { downloadsQuery } from '@/queries/downloads.query.ts'
import { guidesQuery, itemsPerPage } from '@/queries/guides.query.ts'
import { Page } from '@/routes/-page.tsx'
import { StatusZod } from '@/types/status.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon, VerifiedIcon } from 'lucide-react'
import { fromPromise } from 'neverthrow'
import { z } from 'zod'

export const Route = createFileRoute('/downloads/$status')({
  component: DownloadGuidePage,
  params: {
    parse: (status) => {
      return z
        .object({
          status: StatusZod,
        })
        .parse(status)
    },
    stringify: (params) => {
      return {
        status: params.status,
      }
    },
  },
  validateSearch: ({ search }) => {
    return z
      .object({
        page: z.number().default(1),
      })
      .default({
        page: 1,
      })
      .parse(search)
  },
  loaderDeps: ({ search }) => {
    return {
      page: search.page,
    }
  },
  loader: async ({ context, params, deps: { page } }) => {
    await context.queryClient.ensureQueryData(guidesQuery({ status: params.status, page }))
  },
  pendingComponent: () => {
    const status = Route.useParams({ select: (p) => p.status })

    return (
      <Page key={`download-${status}`} to="/downloads" title={titleByStatus(status)}>
        <GenericLoader />
      </Page>
    )
  },
})

function titleByStatus(status: string) {
  switch (status) {
    case 'public':
      return 'Guides publics'
    case 'private':
      return 'Guides privés'
    case 'draft':
      return 'Guides draft'
    case 'gp':
      return 'Guides principaux'
    case 'certified':
      return 'Guides certifiés'
    default:
      return 'Guides'
  }
}

function DownloadGuidePage() {
  const page = Route.useSearch({ select: (s) => s.page })
  const status = Route.useParams({ select: (p) => p.status })
  const guides = useSuspenseQuery(guidesQuery({ status, page }))
  const downloads = useSuspenseQuery(downloadsQuery)
  const downloadGuide = useDownloadGuide()

  const title = titleByStatus(status)

  const nextPages = Math.ceil(guides.data.total / itemsPerPage)

  return (
    <Page key={`download-${status}`} to="/downloads" title={title}>
      <div className="flex grow flex-col pb-8">
        {guides.data.total === 0 ? (
          'Aucun guide trouvé'
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {guides.data.data.map((guide) => (
              <Card key={guide.id}>
                <CardHeader className="p-3">
                  <CardTitle className="leading-5">{guide.name}</CardTitle>
                  <CardDescription className="flex justify-between gap-2">
                    <span>id: {guide.id}</span>
                    <span className="flex items-center gap-2">
                      <span>
                        de: <span className="font-semibold text-blue-600">{guide.user.name}</span>
                      </span>
                      {guide.user.is_certified && <VerifiedIcon className="size-4 text-orange-300" />}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <p>{guide.downloads}</p>
                </CardContent>
                <CardFooter className="gap-x-2 p-3 pt-0">
                  <Button
                    size="icon"
                    onClick={async () => {
                      await fromPromise(downloadGuide.mutateAsync(guide), (err) => err)
                    }}
                  >
                    <DownloadIcon className="size-4" />
                  </Button>
                  {isGuideNew(guide, getGuideById(downloads.data.downloaded_guides, guide.id)) && (
                    <span>MAJ disponible</span>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      {guides.data.total !== 0 && (
        <Pagination className="fixed right-0 bottom-0 left-0 h-10 border bg-white px-2">
          <PaginationContent>
            {page !== 1 && guides.data.total > itemsPerPage && (
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
            )}
            {Array.from({ length: nextPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink size="sm" from={Route.fullPath} to="." params={{ status }} search={{ page: index + 1 }}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      )}
    </Page>
  )
}
