import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideDownloadButton } from '@/components/guide-card.tsx'
import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Button } from '@/components/ui/button.tsx'
import { Card } from '@/components/ui/card.tsx'
import { ClearInput } from '@/components/ui/clear-input'
import { useProfile } from '@/hooks/use_profile'
import { rankList } from '@/lib/rank'
import { useOpenGuidesFolder } from '@/mutations/open-guides-folder.mutation'
import { confQuery } from '@/queries/conf.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Page } from '@/routes/-page.tsx'
import { Trans, t } from '@lingui/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRightIcon, FolderOpenIcon, FolderSyncIcon } from 'lucide-react'
import { useState } from 'react'
import { FlagPerLang } from '../../components/flag-per-lang'

export const Route = createFileRoute('/guides/')({
  component: GuidesPage,
  pendingComponent: Pending,
})

function Pending() {
  return (
    <Page
      title={t`Guides`}
      key="guide-page"
      actions={
        <div className="flex w-full items-center justify-end gap-1 text-sm">
          <Button size="icon-sm" variant="secondary" disabled>
            <FolderSyncIcon className="size-4" />
          </Button>
          <Button size="icon-sm" variant="secondary" disabled>
            <FolderOpenIcon className="size-4" />
          </Button>
        </div>
      }
    >
      <PageScrollableContent className="flex items-center justify-center">
        <div className="flex items-center justify-center">
          <GenericLoader />
        </div>
      </PageScrollableContent>
    </Page>
  )
}

function GuidesPage() {
  const conf = useSuspenseQuery(confQuery)
  const profile = useProfile()
  const guides = useSuspenseQuery(guidesQuery)
  const openGuidesFolder = useOpenGuidesFolder()
  const [searchTerm, setSearchTerm] = useState('')

  const guidesWithCurrentProgression = guides.data.guides.map((guide) => {
    const currentStep = profile.progresses.find((progress) => progress.id === guide.id)?.currentStep ?? null

    return {
      ...guide,
      currentStep,
    }
  })
  const notDoneGuides = conf.data.showDoneGuides
    ? guidesWithCurrentProgression
    : // Filter out guides that are done (all steps are completed in the profile)
      guidesWithCurrentProgression.filter((guide) => {
        return guide.currentStep === null || guide.currentStep < guide.steps.length - 1
      })
  const filteredGuides = rankList(notDoneGuides, [(guide) => guide.name], searchTerm)

  const onRefresh = () => {
    if (!guides.isFetching) {
      guides.refetch()
    }
  }

  const onOpenExplorer = () => {
    if (!openGuidesFolder.isPending) {
      openGuidesFolder.mutate()
    }
  }

  return (
    <Page
      key="guide-page"
      title={t`Guides`}
      actions={
        <div className="flex w-full items-center justify-end gap-1 text-sm">
          {guides.isFetched && guides.isFetching && <GenericLoader className="size-4" />}
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={onRefresh}
            title={t`Rafraichir le dossier des guides téléchargés`}
            className="size-6 min-h-6 min-w-6 sm:size-7 sm:min-h-7 sm:min-w-7"
          >
            <FolderSyncIcon className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={onOpenExplorer}
            title={t`Ouvrir le dossier des guides téléchargés`}
            className="size-6 min-h-6 min-w-6 sm:size-7 sm:min-h-7 sm:min-w-7"
          >
            <FolderOpenIcon className="size-4" />
          </Button>
        </div>
      }
    >
      <PageScrollableContent className="p-2">
        <div className="flex flex-col gap-2">
          <ClearInput
            value={searchTerm}
            onChange={(evt) => setSearchTerm(evt.currentTarget.value)}
            onValueChange={setSearchTerm}
            autoComplete="off"
            autoCorrect="off"
            placeholder={t`Rechercher un guide`}
          />

          {filteredGuides.map((guide) => {
            const step = (guide.currentStep ?? 0) + 1
            const totalSteps = guide.steps.length
            const percentage = (((step - 1) / (totalSteps - 1)) * 100).toFixed(1)
            const hasOpenButton = guide.steps.length > 0

            return (
              <Card key={guide.id} className="flex gap-2 p-2 xs:px-3 text-xxs xs:text-sm sm:text-base">
                <div className="flex flex-col items-center gap-0.5">
                  <FlagPerLang lang={guide.lang} />
                  <span className="whitespace-nowrap text-xxs">
                    <Trans>
                      id <span className="text-yellow-300">{guide.id}</span>
                    </Trans>
                  </span>
                </div>
                <div className="flex grow flex-col gap-1">
                  <h3 className="grow text-balance">{guide.name}</h3>
                  <p className="inline-flex gap-1 self-end">
                    <span>
                      <span className="text-yellow-300">{step}</span>/{totalSteps}
                    </span>
                    <span>({percentage}%)</span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button asChild variant="secondary" size="icon" disabled={!hasOpenButton}>
                    <Link
                      to="/guides/$id"
                      params={{ id: guide.id }}
                      search={{ step: guide.currentStep ?? 0 }}
                      draggable={false}
                    >
                      <ChevronRightIcon />
                    </Link>
                  </Button>
                  <GuideDownloadButton guide={guide} />
                </div>
              </Card>
            )
          })}
        </div>
      </PageScrollableContent>
    </Page>
  )
}
