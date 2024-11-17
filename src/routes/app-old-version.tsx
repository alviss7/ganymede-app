import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/macro'
import { createFileRoute } from '@tanstack/react-router'
import { platform as getPlatform } from '@tauri-apps/plugin-os'

export const Route = createFileRoute('/app-old-version')({
  component: AppOldVersionPage,
})

function AppOldVersionPage() {
  const platform = getPlatform()

  return (
    <p className="flex grow flex-col justify-center gap-5 p-4">
      <Trans>
        Vous ne disposez pas de la dernière version de Ganymède. Veuillez télécharger la dernière version. <br />
        <Button asChild size="lg">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://ganymede-dofus.com/download#${platform === 'macos' ? 'manual-install-macos' : 'auto-install-windows'}`}
          >
            Télécharger maintenant
          </a>
        </Button>
      </Trans>
    </p>
  )
}
