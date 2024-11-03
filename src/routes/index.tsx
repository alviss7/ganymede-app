import { DiscordIcon } from '@/components/icons/discord-icon.tsx'
import { TwitterIcon } from '@/components/icons/twitter-icon.tsx'
import { PageTitle, PageTitleExtra, PageTitleText } from '@/components/page-title.tsx'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon } from 'lucide-react'
import { AlmanaxFrame } from '../components/almanax-frame'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex grow flex-col">
      <PageTitle>
        <PageTitleText>Présentation</PageTitleText>
        <PageTitleExtra>v0.28</PageTitleExtra>
      </PageTitle>
      <article className="prose-sm grow px-2 text-sm">
        <p>
          Bienvenue sur <span className="text-orange-300">GANYMÈDE</span> !
        </p>
        <p>
          Cet outil a pour but de vous assister tout au long de votre aventure sur{' '}
          <span className="text-green-400">Dofus</span> !
        </p>
        <p>Vous pouvez créer, utiliser et partager des guides vous permettant d'optimiser votre aventure.</p>
        <p>Créez vos guides via le site officiel et téléchargez ceux des autres !</p>
      </article>
      <AlmanaxFrame />
      <div className="flex justify-center gap-2">
        <a
          href="https://discord.gg/fxWuXB3dct"
          target="_blank"
          rel="noreferrer noopener"
          className="flex size-9 items-center justify-center"
        >
          <DiscordIcon className="size-6" />
        </a>
        <a
          href="https://x.com/GanymedeDofus"
          target="_blank"
          rel="noreferrer noopener"
          className="flex size-9 items-center justify-center"
        >
          <TwitterIcon className="size-4" />
        </a>
        <a
          href="https://ganymede-dofus.com"
          target="_blank"
          rel="noreferrer noopener"
          className="flex size-9 items-center justify-center"
        >
          <GlobeIcon className="size-5" />
        </a>
      </div>
      <div className="text-center text-xs">Ganymède - Non affilié à Ankama Games</div>
    </div>
  )
}
