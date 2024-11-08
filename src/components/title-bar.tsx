import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Link } from '@tanstack/react-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import {
  CloudDownloadIcon,
  HomeIcon,
  LocateIcon,
  MaximizeIcon,
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
              Accueil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/guides" draggable={false}>
              <NotebookTextIcon />
              Guides
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/downloads" draggable={false}>
              <CloudDownloadIcon />
              Téléchargements
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/auto-pilot" draggable={false}>
              <LocateIcon />
              Autopilotage
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link to="/notes" draggable={false}>
              <NotebookPenIcon />
              Notes
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="center-absolute cursor-default select-none text-center font-semibold">Ganymède</p>
      <p data-tauri-drag-region="" className="relative z-10 size-full grow"></p>
      <div className="flex justify-end">
        <Link
          to="/settings"
          className="inline-flex size-[30px] items-center justify-center hover:bg-primary-800"
          draggable={false}
        >
          <SettingsIcon className="size-4" />
        </Link>
        <button
          onClick={async () => {
            await appWindow.minimize()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-primary-800"
          id="titlebar-minimize"
        >
          <MinusIcon className="size-4" />
        </button>
        <button
          onClick={async () => {
            await appWindow.toggleMaximize()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-primary-800"
          id="titlebar-maximize"
        >
          <MaximizeIcon className="size-4" />
        </button>
        <button
          onClick={async () => {
            await appWindow.close()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-primary-800"
          id="titlebar-close"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
