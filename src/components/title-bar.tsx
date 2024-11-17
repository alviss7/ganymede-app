import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Trans, t } from '@lingui/macro'
import { Link } from '@tanstack/react-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import {
  CloudDownloadIcon,
  CrosshairIcon,
  HomeIcon,
  LocateIcon,
  MenuIcon,
  MinusIcon,
  NotebookPenIcon,
  NotebookTextIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react'

const appWindow = getCurrentWindow()

export function TitleBar() {
  return (
    <div className="sticky top-0 z-10 flex h-[30px] items-center bg-primary text-primary-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-full px-2 outline-none">
          <MenuIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" alignOffset={6} sideOffset={0}>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/" draggable={false}>
              <HomeIcon />
              <Trans>Accueil</Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/guides" draggable={false}>
              <NotebookTextIcon />
              <Trans>Guides</Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/downloads" draggable={false}>
              <CloudDownloadIcon />
              <Trans>Téléchargements</Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/auto-pilot" draggable={false}>
              <LocateIcon />
              <Trans>Autopilotage</Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/notes" draggable={false}>
              <NotebookPenIcon />
              <Trans>Notes</Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <a target="_blank" href="https://dofusdb.fr/fr/tools/treasure-hunt" draggable={false}>
              <CrosshairIcon />
              <Trans>Chasse au trésor</Trans>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="center-absolute cursor-default select-none text-center font-semibold text-sm sm:text-base">
        Ganymède
      </p>
      <p data-tauri-drag-region="" className="relative z-10 size-full grow"></p>
      <div className="flex justify-end">
        <Link
          to="/settings"
          className="inline-flex size-7 items-center justify-center hover:bg-primary-800"
          draggable={false}
          title={t`Paramètres`}
        >
          <SettingsIcon className="size-4" />
        </Link>
        <button
          onClick={async () => {
            await appWindow.minimize()
          }}
          className="inline-flex size-7 items-center justify-center hover:bg-primary-800"
          id="titlebar-minimize"
          title={t`Réduire`}
        >
          <MinusIcon className="size-4" />
        </button>
        <button
          onClick={async () => {
            await appWindow.close()
          }}
          className="inline-flex size-7 items-center justify-center hover:bg-destructive"
          id="titlebar-close"
          title={t`Fermer`}
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
