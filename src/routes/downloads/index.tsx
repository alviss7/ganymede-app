import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Card } from '@/components/ui/card'
import { Page } from '@/routes/-page.tsx'
import { Trans, t } from '@lingui/macro'
import { Slot } from '@radix-ui/react-slot'
import { Link, LinkProps, type RegisteredRouter, createFileRoute } from '@tanstack/react-router'
import { BookOpenCheckIcon, BookOpenTextIcon, NotebookPenIcon, TrophyIcon } from 'lucide-react'
import { type JSX, type PropsWithChildren } from 'react'

export const Route = createFileRoute('/downloads/')({
  component: DownloadIndex,
})

function GuideLink({
  params,
  icon,
  children,
}: PropsWithChildren<{
  params: LinkProps<RegisteredRouter, string, '/downloads/$status'>['params']
  icon: JSX.Element
}>) {
  return (
    <Card asChild className="flex flex-col">
      <li>
        <Link
          to="/downloads/$status"
          params={params}
          search={{ page: 1 }}
          className="flex w-full items-center gap-x-2 p-3 text-sm xs:text-base"
          draggable={false}
        >
          <span>
            <Slot>{icon}</Slot>
          </span>
          <span className="font-semibold">{children}</span>
        </Link>
      </li>
    </Card>
  )
}

function DownloadIndex() {
  return (
    <Page title={t`Catégories`}>
      <PageScrollableContent className="p-2">
        <ul className="flex flex-col gap-2">
          <GuideLink params={{ status: 'gp' }} icon={<BookOpenTextIcon />}>
            <Trans>Guides principaux</Trans>
          </GuideLink>
          <GuideLink params={{ status: 'certified' }} icon={<TrophyIcon />}>
            <Trans>Guides certifiés</Trans>
          </GuideLink>
          <GuideLink params={{ status: 'public' }} icon={<BookOpenCheckIcon />}>
            <Trans>Guides publics</Trans>
          </GuideLink>
          <GuideLink params={{ status: 'draft' }} icon={<NotebookPenIcon />}>
            <Trans>Guides draft</Trans>
          </GuideLink>
        </ul>
      </PageScrollableContent>
    </Page>
  )
}
