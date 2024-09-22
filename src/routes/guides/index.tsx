import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideCardFooter, GuideCardHeader, GuideDownloadButton } from '@/components/guide-card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card } from '@/components/ui/card.tsx'
import { confQuery } from '@/queries/conf.query.ts'
import { downloadsQuery } from '@/queries/downloads.query.ts'
import { Page } from '@/routes/-page.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'

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
  const downloads = useSuspenseQuery(downloadsQuery)

  return (
    <Page key="guide-page" title="Guides">
      <div className="flex flex-col gap-2 p-4">
        {downloads.data.downloaded_guides.map((guide) => {
          const profile = conf.data.profiles.find((profile) => profile.id === conf.data.profileInUse)
          const progress = profile?.progresses.find((progress) => progress.id === guide.id)

          return (
            <Card key={guide.id}>
              <GuideCardHeader guide={guide} />
              <GuideCardFooter className="justify-between">
                <GuideDownloadButton guide={guide} />
                <Button size="icon" asChild>
                  <Link to="/guides/$id" params={{ id: guide.id }} search={{ step: progress?.step ?? 0 }}>
                    <ChevronRightIcon className="size-4" />
                  </Link>
                </Button>
              </GuideCardFooter>
            </Card>
          )
        })}
      </div>
    </Page>
  )
}
