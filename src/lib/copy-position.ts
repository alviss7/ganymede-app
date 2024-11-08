import { Conf } from '@/types/conf'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

export async function copyPosition(posX: number, posY: number, conf: Conf): Promise<void> {
  let copy = `[${posX},${posY}]`

  if (conf.autoTravelCopy) {
    copy = `/travel ${posX},${posY}`
  }

  await writeText(copy)
}
