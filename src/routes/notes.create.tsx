import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSetConf } from '@/mutations/set-conf.mutation'
import { confQuery } from '@/queries/conf.query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Page } from './-page'
import { Textarea } from '../components/ui/textarea'
import { z } from 'zod'

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
      <form
        className="flex flex-col gap-2 p-2"
        onSubmit={async (evt) => {
          evt.preventDefault()
          const target = evt.target as HTMLFormElement
          const data = new FormData(target)

          const name = (data.get('name') as string).trim()
          const text = (data.get('text') as string).trim().replace(/\[?\]?/g, '')

          const note = conf.data.notes.find((note) => note.name === name)

          console.log(conf.data)

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
        <div className="flex flex-row-reverse gap-2">
          <Button type="submit" size="icon" className="min-w-9">
            <PlusIcon />
          </Button>
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
        </div>
        <Textarea
          placeholder={`Contenu de la note.\n\nDepuis le menu précédent, une fois créée, je peux la modifier en cliquant dessus, ou copier son contenu.`}
          name="text"
          className="grow resize-none placeholder:italic"
          required
          autoComplete="off"
          autoCapitalize="off"
          rows={13}
        >
          {note?.text}
        </Textarea>
      </form>
    </Page>
  )
}
