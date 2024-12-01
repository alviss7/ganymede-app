import { BottomBar } from '@/components/bottom-bar'
import { FlagPerLang } from '@/components/flag-per-lang'
import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideDownloadButton } from '@/components/guide-card.tsx'
import { PageScrollableContent } from '@/components/page-scrollable-content'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card.tsx'
import { ClearInput } from '@/components/ui/clear-input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination.tsx'
import { useScrollToTop } from '@/hooks/use_scroll_to_top'
import { getGuideById } from '@/lib/guide'
import { rankList } from '@/lib/rank'
import { paginate } from '@/lib/search'
import { guidesFromServerQuery, itemsPerPage } from '@/queries/guides-from-server.query.ts'
import { guidesQuery } from '@/queries/guides.query'
import { Page } from '@/routes/-page.tsx'
import { StatusZod } from '@/types/status.ts'
import { Trans, t } from '@lingui/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { ChevronRightIcon, VerifiedIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { z } from 'zod'

const SearchZod = z.object({
  page: z.coerce.number(),
  search: z.string().optional(),
})

export const Route = createFileRoute('/_app/downloads/$status')({
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
  const downloads = useSuspenseQuery(guidesQuery)

  const scrollableRef = useRef<HTMLDivElement>(null)

  useScrollToTop(scrollableRef, [page, status])

  const title = titleByStatus(status)
  const nextPages = Math.ceil(guides.data.length / itemsPerPage)

  const term = searchTerm !== '' ? debouncedTerm : ''

  const filteredGuides = rankList({
    list: guides.data,
    keys: [(guide) => guide.name, (guide) => guide.user.name],
    term: term,
    sortKeys: [(guide) => guide.order],
  })

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
      <AlertDialog defaultOpen={status === 'draft' || status === 'public'}>
        <AlertDialogContent className="data-[state=open]:fade-in-100 data-[state=open]:zoom-in-100 data-[state=open]:slide-in-from-top-1/2">
          <AlertDialogHeader>
            <Trans>Attention</Trans>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <Trans>
              Les guides de cette section n'ont pas été vérifiés manuellement par l'équipe Ganymède. <br /> Bien que les
              liens vers les sites soient sécurisés, veuillez vérifier attentivement les guides{' '}
              <strong className="font-semibold">sur notre site</strong> avant de les télécharger.
            </Trans>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>J'ai compris</Trans>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PageScrollableContent hasBottomBar={hasPagination} className="p-2" ref={scrollableRef}>
        <div className="flex grow flex-col text-xs sm:text-sm">
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
                autoCapitalize="off"
                placeholder={t`Rechercher un guide`}
              />

              {paginatedOrFilteredGuides.length === 0 && (
                <p className="text-center">
                  <Trans>Aucun guides trouvé avec {term}</Trans>
                </p>
              )}

              {paginatedOrFilteredGuides.map((guide) => {
                const isGuideDownloaded = getGuideById(downloads.data.guides, guide.id)

                return (
                  <Card key={guide.id} className="flex gap-2 p-2 xs:px-3 text-xxs xs:text-sm sm:text-base">
                    <div className="flex min-w-9 flex-col items-center gap-0.5">
                      <FlagPerLang lang={guide.lang} />
                      <span className="whitespace-nowrap text-xxs">
                        <Trans>
                          id <span className="text-yellow-300">{guide.id}</span>
                        </Trans>
                      </span>
                    </div>
                    <div className="flex grow flex-col gap-1">
                      <h3 className="grow text-balance">{guide.name}</h3>
                      <p className="inline-flex items-center gap-1 self-end">
                        <span>
                          <Trans>
                            de <span className="font-semibold text-blue-400">{guide.user.name}</span>
                          </Trans>
                        </span>
                        {guide.user.is_certified === 1 && <VerifiedIcon className="size-3 xs:size-4 text-orange-300" />}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="secondary" size="icon" disabled={!isGuideDownloaded} asChild>
                        <Link to="/guides/$id" params={{ id: guide.id }} search={{ step: 0 }} draggable={false}>
                          <ChevronRightIcon />
                        </Link>
                      </Button>
                      <GuideDownloadButton guide={guide} />
                    </div>
                  </Card>
                )
              })}
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
                      size="icon"
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
