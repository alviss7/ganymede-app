import { GenericLoader } from '@/components/generic-loader'
import { PageScrollableContent } from '@/components/page-scrollable-content'
import { Button } from '@/components/ui/button'
import { useSetConf } from '@/mutations/set-conf.mutation'
import { confQuery } from '@/queries/conf.query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { CopyIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Page } from './-page'

export const Route = createFileRoute('/notes/')({
  component: NotesPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(confQuery)
  },
  pendingComponent: () => {
    return (
      <Page
        key="notes-page"
        title="Notes"
        actions={
          <div className="flex w-full items-center justify-end gap-1 text-sm">
            <Button size="icon-sm" variant="secondary" disabled>
              <PlusIcon />
            </Button>
          </div>
        }
      >
        <PageScrollableContent className="flex items-center justify-center">
          <GenericLoader />
        </PageScrollableContent>
      </Page>
    )
  },
  pendingMs: 200,
})

function NotesPage() {
  const conf = useSuspenseQuery(confQuery)
  const setConf = useSetConf()

  return (
    <Page
      key="notes-page"
      title="Notes"
      actions={
        <div className="flex w-full items-center justify-end gap-1 text-sm">
          <Button size="icon-sm" variant="secondary" asChild>
            <Link to="/notes/create" search={{}} draggable={false}>
              <PlusIcon />
            </Link>
          </Button>
        </div>
      }
    >
      <PageScrollableContent className="p-2">
        <ul className="flex flex-col gap-2">
          {conf.data.notes.map((note) => {
            return (
              <li key={note.name} className="flex w-full justify-between gap-2">
                <Button asChild className="grow">
                  <Link to="/notes/create" search={{ name: note.name }} draggable={false}>
                    <p className="text-slate-300">{note.name}</p>
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={async () => {
                    await writeText(note.text)
                  }}
                >
                  <CopyIcon />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setConf.mutate({
                      ...conf.data,
                      notes: conf.data.notes.filter((pilot) => pilot.name !== note.name),
                    })
                  }}
                >
                  <TrashIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      </PageScrollableContent>
    </Page>
  )
}
