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
    <li className="flex flex-col rounded bg-gray-400 shadow">
      <Link
        to="/downloads/$status"
        params={params}
        search={{ page: 1 }}
        className="flex w-full items-center gap-x-2 px-2 py-4"
      >
        <span>
          <Slot className="size-4">{icon}</Slot>
        </span>
        <span className="font-semibold">{children}</span>
      </Link>
    </li>
  )
}

function DownloadIndex() {
  return (
    <Page title="Catégories">
      <ul className="flex flex-col gap-2 p-4">
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
    </Page>
  )
}
