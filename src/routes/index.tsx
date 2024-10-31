import { DiscordIcon } from '@/components/icons/discord-icon.tsx'
import { TwitterIcon } from '@/components/icons/twitter-icon.tsx'
import { PageTitle, PageTitleExtra, PageTitleText } from '@/components/page-title.tsx'
import { almanaxQuery } from '@/queries/almanax.query.ts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LoaderIcon } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const almanax = useQuery(almanaxQuery)

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
      <div className="mx-4 flex grow items-center justify-center border p-2">
        {almanax.isLoading && <LoaderIcon className="size-8 text-blue-400" />}
        {almanax.isSuccess && (
          <div className="flex flex-col gap-0.5">
            <div className="text-center text-lg">Almanax LVL: 200</div>
            <div className="text-center text-xs">
              {almanax.data.quantity}x {almanax.data.name}
            </div>
            <div className="text-center text-xs">{almanax.data.experience} EXP</div>
            <div className="text-center text-xs">{almanax.data.kamas} KAMAS</div>
            <div
              className="prose-sm text-center text-xs leading-4"
              dangerouslySetInnerHTML={{ __html: almanax.data.bonus }}
            />
          </div>
        )}
      </div>
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
