import { GenericLoader } from '@/components/generic-loader.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { newId } from '@/ipc/id.ts'
import { useSetConf } from '@/mutations/set-conf.mutation.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { Page } from '@/routes/-page.tsx'
import { Lang } from '@/types/conf.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: Settings,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(confQuery)
  },
  pendingComponent: () => {
    return (
      <Page key="settings-page" title="Paramètres">
        <GenericLoader />
      </Page>
    )
  },
  pendingMs: 200,
})

function Settings() {
  const conf = useSuspenseQuery(confQuery)
  const setConf = useSetConf()

  return (
    <Page key="settings-page" title="Paramètres">
      <div className="container flex flex-col gap-4 pt-4 text-sm">
        <section className="flex items-center justify-between gap-2">
          <Label htmlFor="auto-travel-copy">Copie d'autopilote</Label>
          <Switch
            id="auto-travel-copy"
            checked={conf.data.autoTravelCopy}
            onCheckedChange={(checked) => {
              setConf.mutate({
                ...conf.data,
                autoTravelCopy: checked,
              })
            }}
          />
        </section>
        <section className="flex items-center justify-between gap-2">
          <Label htmlFor="show-done-guides">Afficher les guides terminés</Label>
          <Switch
            id="show-done-guides"
            checked={conf.data.showDoneGuides}
            onCheckedChange={(checked) => {
              setConf.mutate({
                ...conf.data,
                showDoneGuides: checked,
              })
            }}
          />
        </section>
        <section className="space-y-2">
          <Label htmlFor="lang-guides">Langue des guides</Label>
          <Select
            value={conf.data.lang}
            onValueChange={(value) => {
              setConf.mutate({
                ...conf.data,
                lang: value as Lang,
              })
            }}
          >
            <SelectTrigger id="lang-guides">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fr">Français</SelectItem>
              <SelectItem value="En">English</SelectItem>
              <SelectItem value="Es">Español</SelectItem>
              <SelectItem value="Pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </section>
        <section className="space-y-2">
          <Label htmlFor="profiles">Profils</Label>
          <Select
            value={conf.data.profileInUse}
            onValueChange={(value) => {
              setConf.mutate({
                ...conf.data,
                profileInUse: value,
              })
            }}
          >
            <SelectTrigger id="profiles">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conf.data.profiles.map((profile) => {
                return (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </section>
        <section className="space-y-2">
          <Label htmlFor="create-profile">Créer un profil</Label>
          <form
            className="space-y-2"
            onSubmit={async (evt) => {
              evt.preventDefault()
              const form = evt.currentTarget

              const profileName = form.newProfile.value as string

              // Check if the profile name is not empty and if it doesn't already exist
              if (profileName.trim() !== '' && !conf.data.profiles.find((p) => p.name === profileName.trim())) {
                const id = await newId()

                id.map((id) => {
                  setConf.mutate({
                    ...conf.data,
                    profiles: [
                      ...conf.data.profiles,
                      {
                        id,
                        name: profileName.trim(),
                        progresses: [],
                      },
                    ],
                    profileInUse: id,
                  })

                  form.newProfile.value = ''
                })
                // TODO: handle error
              }
            }}
          >
            <Input id="create-profile" name="newProfile" autoCorrect="off" autoCapitalize="off" />
            <Button type="submit">Créer</Button>
          </form>
        </section>
      </div>
    </Page>
  )
}
