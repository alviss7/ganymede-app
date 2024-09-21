import { DownloadZod } from '@/types/download.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export class GetDownloadsError extends Error {
  static from(error: unknown) {
    return new GetDownloadsError('Failed to get downloads', { cause: error })
  }
}

export class SetDownloadsError extends Error {
  static from(error: unknown) {
    return new SetDownloadsError('Failed to set downloads', { cause: error })
  }
}

export class DownloadGuideId extends Error {
  static from(error: unknown) {
    return new DownloadGuideId('Failed to download guide', { cause: error })
  }
}

export function getDownloadedGuides() {
  return fromPromise(invoke('get_downloads'), GetDownloadsError.from).map((response) => {
    return DownloadZod.parseAsync(response)
  })
}

export async function downloadGuide(guideId: number) {
  return fromPromise(invoke('download_guide', { guideId }), DownloadGuideId.from).map((response) => {
    return DownloadZod.parseAsync(response)
  })
}
