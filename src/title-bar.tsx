import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { ChevronDownIcon } from 'lucide-react'

const appWindow = getCurrentWindow()

export function TitleBar() {
  return (
    <div className="sticky top-0 flex h-[30px] items-center bg-[#329ea3]">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-full px-2">
          <ChevronDownIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="#">Guides</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="#">Paramètres</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p data-tauri-drag-region="" className="grow cursor-default select-none text-center font-semibold">
        Ganymède
      </p>
      <div className="flex justify-end">
        <button
          onClick={async () => {
            await appWindow.minimize()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-[#5bbec3]"
          id="titlebar-minimize"
        >
          <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
        </button>
        <button
          onClick={async () => {
            await appWindow.toggleMaximize()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-[#5bbec3]"
          id="titlebar-maximize"
        >
          <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
        </button>
        <button
          onClick={async () => {
            await appWindow.close()
          }}
          className="inline-flex size-[30px] items-center justify-center hover:bg-[#5bbec3]"
          id="titlebar-close"
        >
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </button>
      </div>
    </div>
  )
}
