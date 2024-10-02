import { PageTitle, PageTitleExtra, PageTitleText } from '@/components/page-title.tsx'
import { createFileRoute } from '@tanstack/react-router'

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
      <div className="mx-4 flex grow items-center justify-center border p-4">Almanax ici</div>
      <div className="flex justify-center">Liens Discord, etc</div>
      <div className="text-center text-xs">Ganymède - Non affilié à Ankama Games</div>
    </div>
  )
}
