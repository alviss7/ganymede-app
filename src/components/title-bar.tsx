import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Link } from '@tanstack/react-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { MaximizeIcon, MenuIcon, MinusIcon, SettingsIcon, XIcon } from 'lucide-react'

const appWindow = getCurrentWindow()

export function TitleBar() {
  return (
    <div className="sticky top-0 flex h-[30px] items-center bg-primary">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-full px-2 outline-none">
          <MenuIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" alignOffset={6} sideOffset={0}>
          <DropdownMenuItem asChild>
            <Link to="/">Accueil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/guides">Guides</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/downloads">Téléchargements</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p data-tauri-drag-region="" className="grow cursor-default select-none text-center font-semibold">
        Ganymède
      </p>
      <div className="flex justify-end">
        <Link to="/settings" className="inline-flex size-[30px] items-center justify-center hover:bg-primary-800">
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
