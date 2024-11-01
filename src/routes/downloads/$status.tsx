import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideCardFooter, GuideCardHeader, GuideDownloadButton } from '@/components/guide-card.tsx'
import { Card } from '@/components/ui/card.tsx'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination.tsx'
import { guidesFromServerQuery, itemsPerPage } from '@/queries/guides-from-server.query.ts'
import { Page } from '@/routes/-page.tsx'
import { StatusZod } from '@/types/status.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const SearchZod = z.object({
  page: z.coerce.number(),
})

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
  validateSearch: SearchZod.parse,
  loaderDeps: ({ search }) => {
    return {
      page: search.page,
    }
  },
  loader: async ({ context, params, deps: { page } }) => {
    console.log('start')
    await context.queryClient.ensureQueryData(guidesFromServerQuery({ status: params.status, page }))
  },
  pendingComponent: Pending,
})

function Pending() {
  const status = Route.useParams({ select: (p) => p.status })

  return (
    <Page key={`download-${status}`} to="/downloads" title={titleByStatus(status)}>
      <div className="flex grow items-center justify-center">
        <GenericLoader />
      </div>
    </Page>
  )
}

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
  const guides = useSuspenseQuery(guidesFromServerQuery({ status, page }))

  const title = titleByStatus(status)

  const nextPages = Math.ceil(guides.data.total / itemsPerPage)

  return (
    <Page key={`download-${status}`} to="/downloads" title={title}>
      <div className="flex grow flex-col pb-8">
        {guides.data.total === 0 ? (
          <p className="p-4">Aucun guide trouvé</p>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {guides.data.data.map((guide) => (
              <Card key={guide.id}>
                <GuideCardHeader guide={guide} />
                <GuideCardFooter>
                  <GuideDownloadButton guide={guide} />
                </GuideCardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      {guides.data.total !== 0 && guides.data.total > itemsPerPage && (
        <Pagination className="fixed right-0 bottom-0 left-0 h-10 border bg-white px-2 text-black">
          <PaginationContent>
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
