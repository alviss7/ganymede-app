import { GuideZod } from '@/types/guide.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'
import { z } from 'zod'

export class GetGuidesFromServerError extends Error {
  static from(error: unknown) {
    return new GetGuidesFromServerError('Failed to get guides', { cause: error })
  }
}

export function getGuidesFromServer(status: string) {
  return fromPromise(invoke('get_guides_from_server', { status }), GetGuidesFromServerError.from).map((res) => {
    return z.array(GuideZod).parseAsync(res)
  })
}
