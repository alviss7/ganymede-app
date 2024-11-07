import { GuidesZod } from '@/types/download.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export class GetGuidesError extends Error {
  static from(error: unknown) {
    return new GetGuidesError('Failed to get guides', { cause: error })
  }
}

export class DownloadGuideFromServerError extends Error {
  static from(error: unknown) {
    return new DownloadGuideFromServerError('Failed to download guide', { cause: error })
  }
}

export class OpenGuidesFolderError extends Error {
  static from(error: unknown) {
    return new OpenGuidesFolderError('Failed to open guides folder', { cause: error })
  }
}

export class ToggleGuideCheckboxError extends Error {
  static from(error: unknown) {
    return new ToggleGuideCheckboxError('Failed to toggle checkbox guide', { cause: error })
  }
}

export function getGuides() {
  return fromPromise(invoke('get_guides'), GetGuidesError.from).map((response) => {
    return GuidesZod.parseAsync(response)
  })
}

export async function downloadGuideFromServer(guideId: number) {
  return fromPromise(invoke('download_guide_from_server', { guideId }), DownloadGuideFromServerError.from)
}

export async function openGuidesFolder() {
  return fromPromise(invoke('open_guides_folder'), OpenGuidesFolderError.from)
}

export async function toggleGuideCheckbox(guideId: number, checkboxIndex: number, stepIndex: number) {
  return fromPromise(
    invoke<number | undefined>('toggle_guide_checkbox', { guideId, checkboxIndex, stepIndex }),
    ToggleGuideCheckboxError.from,
  )
}
