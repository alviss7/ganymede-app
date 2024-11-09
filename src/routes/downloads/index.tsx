import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Card } from '@/components/ui/card'
import { Page } from '@/routes/-page.tsx'
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
    <Card asChild className="flex flex-col p-3">
      <li>
        <Link
          to="/downloads/$status"
          params={params}
          search={{ page: 1 }}
          className="flex w-full items-center gap-x-2"
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
    <Page title="Catégories">
      <PageScrollableContent className="p-2">
        <ul className="flex flex-col gap-2">
          <GuideLink params={{ status: 'gp' }} icon={<BookOpenTextIcon />}>
            Guides principaux
          </GuideLink>
          <GuideLink params={{ status: 'certified' }} icon={<TrophyIcon />}>
            Guides certifiés
          </GuideLink>
          <GuideLink params={{ status: 'public' }} icon={<BookOpenCheckIcon />}>
            Guides publics
          </GuideLink>
          <GuideLink params={{ status: 'draft' }} icon={<NotebookPenIcon />}>
            Guides draft
          </GuideLink>
        </ul>
      </PageScrollableContent>
    </Page>
  )
}
