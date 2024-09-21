import { GuideZod } from '@/types/guide.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'
import { z } from 'zod'

export class GetGuidesError extends Error {
  static from(error: unknown) {
    return new GetGuidesError('Failed to get guides', { cause: error })
  }
}

export function getAvailableGuides(status: string) {
  return fromPromise(invoke('get_guides', { status }), GetGuidesError.from).map((res) => {
    return z.array(GuideZod).parseAsync(res)
  })
}
