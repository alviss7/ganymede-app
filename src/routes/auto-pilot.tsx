import { createFileRoute } from '@tanstack/react-router'
import { confQuery } from '@/queries/conf.query'
import { Page } from './-page'
import { GenericLoader } from '@/components/generic-loader'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CopyIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useSetConf } from '@/mutations/set-conf.mutation'
import { copyPosition } from '../lib/copy-position'

export const Route = createFileRoute('/auto-pilot')({
  component: AutoPilotPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(confQuery)
  },
  pendingComponent: () => {
    return (
      <Page key="auto-pilot-page" title="Autopilotage">
        <GenericLoader />
      </Page>
    )
  },
  pendingMs: 200,
})

function AutoPilotPage() {
  const conf = useSuspenseQuery(confQuery)
  const setConf = useSetConf()

  return (
    <Page key="auto-pilot-page" title="Autopilotage" className="relative">
      <form
        className="absolute bottom-0 flex gap-2 p-2"
        onSubmit={(evt) => {
          evt.preventDefault()
          const target = evt.target as HTMLFormElement
          const data = new FormData(target)

          const name = (data.get('name') as string).trim()
          const position = (data.get('position') as string).trim().replace(/\[?\]?/g, '')

          const pilot = conf.data.notes.find((pilot) => pilot.name === name)

          setConf.mutate({
            ...conf.data,
            autoPilots: pilot
              ? conf.data.autoPilots.map((autoPilot) => {
                  if (autoPilot.name === name) {
                    return { name, position }
                  }

                  return autoPilot
                })
              : [...conf.data.autoPilots, { name, position }],
          })

          target.reset()
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
        />
        <Input
          placeholder="2,-30"
          name="position"
          className="placeholder:italic"
          pattern="\[?-?\d+,-?\d+\]?"
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          maxLength={11}
        />
        <Button type="submit" size="icon" className="min-w-9">
          <PlusIcon />
        </Button>
      </form>

      <ul className="flex flex-col gap-2 p-2">
        {conf.data.autoPilots.map((autoPilot) => {
          return (
            <li key={autoPilot.name} className="flex w-full justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  onClick={async () => {
                    const [x, y] = autoPilot.position.split(',').map((n) => Number.parseInt(n, 10))
                    await copyPosition(x, y, conf.data.autoTravelCopy)
                  }}
                >
                  <CopyIcon />
                </Button>
                <p className="font-semibold">[{autoPilot.position}]</p>
                <p className="text-slate-300">{autoPilot.name}</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => {
                  setConf.mutate({
                    ...conf.data,
                    autoPilots: conf.data.autoPilots.filter((pilot) => pilot.name !== autoPilot.name),
                  })
                }}
              >
                <TrashIcon />
              </Button>
            </li>
          )
        })}
      </ul>
    </Page>
  )
}
