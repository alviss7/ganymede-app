import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideCardFooter, GuideCardHeader, GuideDownloadButton } from '@/components/guide-card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { confQuery } from '@/queries/conf.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Page } from '@/routes/-page.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'
import { useProfile } from '../../hooks/use_profile'

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

  return (
    <Page key="guide-page" title="Guides">
      <div className="flex flex-col gap-2 p-4">
        {notDoneGuides.map((guide) => {
          return (
            <Card key={guide.id}>
              <GuideCardHeader guide={guide} />
              <CardContent>
                <p className="text-sm">
                  {(guide.currentStep ?? 0) + 1}/{guide.steps.length}
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
