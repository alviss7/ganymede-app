import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSetConf } from '@/mutations/set-conf.mutation'
import { confQuery } from '@/queries/conf.query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SaveIcon } from 'lucide-react'
import { z } from 'zod'
import { Page } from './-page'

const SearchZod = z.object({
  name: z.string().optional(),
})

export const Route = createFileRoute('/notes/create')({
  component: CreateNotePage,
  validateSearch: (search) => SearchZod.parse(search),
})

function CreateNotePage() {
  const conf = useSuspenseQuery(confQuery)
  const setConf = useSetConf()
  const navigate = useNavigate()
  const noteName = Route.useSearch({ select: (search) => search.name })

  const note = noteName ? conf.data.notes.find((note) => note.name === noteName) : undefined

  return (
    <Page key="create-or-edit-notes-page" title={noteName ? 'Éditer une note' : 'Créer une note'} to="/notes">
      <PageScrollableContent className="p-2">
        <form
          className="flex grow flex-col gap-2"
          onSubmit={async (evt) => {
            evt.preventDefault()
            const target = evt.target as HTMLFormElement
            const data = new FormData(target)

            const name = (data.get('name') as string).trim()
            const text = (data.get('text') as string).trim().replace(/\[?\]?/g, '')

            const note = conf.data.notes.find((note) => note.name === name)

            await setConf.mutateAsync({
              ...conf.data,
              notes: note
                ? conf.data.notes.map((n) => {
                    if (n.name === name) {
                      return { name, text }
                    }

                    return n
                  })
                : [...conf.data.notes, { name, text }],
            })

            await navigate({
              to: '/notes',
            })
          }}
        >
          <Input
            placeholder="Nom"
            name="name"
            className="placeholder:italic"
            required
            minLength={2}
            maxLength={20}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            defaultValue={note?.name}
          />
          <Textarea
            placeholder={`Contenu de la note.\n\nDepuis le menu précédent, une fois créée, je peux la modifier en cliquant dessus, ou copier son contenu.`}
            name="text"
            className="resize-none placeholder:italic"
            required
            autoComplete="off"
            autoCapitalize="off"
            rows={10}
          >
            {note?.text}
          </Textarea>
          <Button type="submit" className="grow">
            <SaveIcon />
            Enregistrer la note
          </Button>
        </form>
      </PageScrollableContent>
    </Page>
  )
}
