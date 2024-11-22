import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useWebviewEvent } from '@/hooks/use_webview_event'
import { clamp } from '@/lib/clamp'
import { cn } from '@/lib/utils'
import { useStartUpdate } from '@/mutations/start-update.mutation'
import { Trans } from '@lingui/macro'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/app-old-version')({
  component: AppOldVersionPage,
})

type UpdateState = 'idle' | 'downloading' | 'finished'

function AppOldVersionPage() {
  const [downloaded, setDownloaded] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [updateState, setUpdateState] = useState<UpdateState>('idle')
  const startUpdate = useStartUpdate()

  const progress = clamp(downloaded && total ? (downloaded / total) * 100 : 0, 4, 100)

  useWebviewEvent('update-started', () => {
    setUpdateState('downloading')
  })

  useWebviewEvent('update-in-progress', (evt) => {
    const [downloaded, content] = evt.payload

    setDownloaded(downloaded)
    setTotal(content)
  })

  useWebviewEvent('update-finished', () => {
    setUpdateState('finished')
  })

  return (
    <div className="flex grow flex-col justify-center gap-5 p-4">
      <p className={cn('text-balance', updateState === 'finished' && 'text-slate-600')}>
        <Trans>
          Vous ne disposez pas de la dernière version de{' '}
          <span className={cn('text-yellow-200', updateState === 'finished' && 'text-current')}>Ganymède</span>.
        </Trans>
      </p>

      {updateState === 'downloading' ? (
        <>
          <p>
            <Trans>Mise à jour en cours.</Trans>
          </p>
          <Progress value={progress} max={100} />
        </>
      ) : updateState === 'finished' ? (
        <p>
          <Trans>Mise à jour terminée. L'application va redémarrer.</Trans>
        </p>
      ) : (
        <Button
          size="lg"
          onClick={() => {
            setUpdateState('downloading')
            startUpdate.mutate()
          }}
          disabled={startUpdate.isPending || startUpdate.isSuccess}
        >
          <Trans>Lancer le téléchargement</Trans>
          {startUpdate.isError && <Trans>Il semblerait que la mise à jour ait eu un problème.</Trans>}
        </Button>
      )}
    </div>
  )
}
