import { BottomBar } from '@/components/bottom-bar'
import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideCardFooter, GuideCardHeader, GuideDownloadButton } from '@/components/guide-card.tsx'
import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Card } from '@/components/ui/card.tsx'
import { ClearInput } from '@/components/ui/clear-input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination.tsx'
import { useScrollToTop } from '@/hooks/use_scroll_to_top'
import { rankList } from '@/lib/rank'
import { paginate } from '@/lib/search'
import { guidesFromServerQuery, itemsPerPage } from '@/queries/guides-from-server.query.ts'
import { Page } from '@/routes/-page.tsx'
import { StatusZod } from '@/types/status.ts'
import { Trans, t } from '@lingui/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { useRef, useState } from 'react'
import { z } from 'zod'

const SearchZod = z.object({
  page: z.coerce.number(),
  search: z.string().optional(),
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
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(guidesFromServerQuery({ status: params.status }))
  },
  pendingComponent: Pending,
})

function Pending() {
  const status = Route.useParams({ select: (p) => p.status })

  return (
    <Page key={`download-${status}`} to="/downloads" title={titleByStatus(status)}>
      <PageScrollableContent className="flex items-center justify-center">
        <div className="flex grow items-center justify-center">
          <GenericLoader />
        </div>
      </PageScrollableContent>
    </Page>
  )
}

function titleByStatus(status: string) {
  switch (status) {
    case 'public':
      return t`Guides publics`
    case 'private':
      return t`Guides privés`
    case 'draft':
      return t`Guides draft`
    case 'gp':
      return t`Guides principaux`
    case 'certified':
      return t`Guides certifiés`
    default:
      return t`Guides`
  }
}

function DownloadGuidePage() {
  const baseSearch = Route.useSearch({ select: (s) => s.search })
  const [searchTerm, setSearchTerm] = useState(baseSearch ?? '')
  const page = Route.useSearch({ select: (s) => s.page })
  const status = Route.useParams({ select: (p) => p.status })
  const debouncedTerm = useDebounce(searchTerm, 300)
  const guides = useSuspenseQuery(guidesFromServerQuery({ status }))

  const scrollableRef = useRef<HTMLDivElement>(null)

  useScrollToTop(scrollableRef, [page, status])

  const title = titleByStatus(status)
  const nextPages = Math.ceil(guides.data.length / itemsPerPage)

  const term = searchTerm !== '' ? debouncedTerm : ''

  const filteredGuides = rankList(guides.data, [(guide) => guide.name, (guide) => guide.user.name], term)

  // if we are searching, we don't want to paginate
  const paginatedOrFilteredGuides =
    term !== ''
      ? filteredGuides
      : paginate({
          page,
          itemsPerPage,
          items: filteredGuides,
        })

  const hasPagination = term === '' && guides.data.length !== 0 && guides.data.length > itemsPerPage

  return (
    <Page key={`download-${status}`} to="/downloads" title={title}>
      <PageScrollableContent hasBottomBar={hasPagination} className="p-2" ref={scrollableRef}>
        <div className="flex grow flex-col">
          {guides.data.length === 0 ? (
            <p className="text-center">
              <Trans>Aucun guides trouvé</Trans>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <ClearInput
                value={searchTerm}
                onChange={(evt) => setSearchTerm(evt.currentTarget.value)}
                onValueChange={setSearchTerm}
                autoComplete="off"
                autoCorrect="off"
                placeholder={t`Rechercher un guide`}
              />

              {paginatedOrFilteredGuides.length === 0 && (
                <p className="text-center">
                  <Trans>Aucun guides trouvé avec {term}</Trans>
                </p>
              )}

              {paginatedOrFilteredGuides.map((guide) => (
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
        {hasPagination && (
          <BottomBar asChild>
            <Pagination>
              <PaginationContent>
                {Array.from({ length: nextPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      size="sm"
                      from={Route.fullPath}
                      to="."
                      params={{ status }}
                      search={{ page: index + 1 }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </BottomBar>
        )}
      </PageScrollableContent>
    </Page>
  )
}
