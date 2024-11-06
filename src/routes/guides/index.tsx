import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideCardFooter, GuideCardHeader, GuideDownloadButton } from '@/components/guide-card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { useProfile } from '@/hooks/use_profile'
import { confQuery } from '@/queries/conf.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Page } from '@/routes/-page.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { ClearInput } from '@/components/ui/clear-input'
import { rankList } from '@/lib/rank'
import { useOpenGuidesFolder } from '@/mutations/open-guides-folder.mutation'
import { FolderOpenIcon, FolderSyncIcon } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/guides/')({
  component: GuidesPage,
  pendingComponent: Pending,
})

function Pending() {
  return (
    <Page title="Guides" key="guide-page">
      <div className="flex grow items-center justify-center">
        <GenericLoader />
      </div>
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
    const currentStep = profile.progresses.find((progress) => progress.id === guide.id)?.step ?? null

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
    openGuidesFolder.mutate()
  }

  return (
    <Page
      key="guide-page"
      title="Guides"
      actions={
        <div className="flex w-full items-center justify-end gap-1 text-sm">
          {guides.isFetched && guides.isFetching && <GenericLoader className="size-4" />}
          <Button size="icon" onClick={onRefresh}>
            <FolderSyncIcon className="size-4" />
          </Button>
          <Button size="icon" onClick={onOpenExplorer}>
            <FolderOpenIcon className="size-4" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 p-4">
        <ClearInput
          value={searchTerm}
          onChange={(evt) => setSearchTerm(evt.currentTarget.value)}
          onValueChange={setSearchTerm}
          autoComplete="off"
          autoCorrect="off"
          placeholder="Rechercher un guide"
        />

        {filteredGuides.map((guide) => {
          return (
            <Card key={guide.id}>
              <GuideCardHeader guide={guide} />
              <CardContent className="px-3">
                <p className="text-sm italic">
                  <span>
                    Progression : {(guide.currentStep ?? 0) + 1}/{guide.steps.length}{' '}
                  </span>
                  <span>({(((guide.currentStep ?? 0) / (guide.steps.length - 1)) * 100).toFixed(1)}%)</span>
                </p>
              </CardContent>
              <GuideCardFooter className="items-end justify-between">
                <GuideDownloadButton guide={guide} />
                {guide.steps.length > 0 && (
                  <Button asChild>
                    <Link to="/guides/$id" params={{ id: guide.id }} search={{ step: guide.currentStep ?? 0 }}>
                      Ouvrir
                    </Link>
                  </Button>
                )}
              </GuideCardFooter>
            </Card>
          )
        })}
      </div>
    </Page>
  )
}
