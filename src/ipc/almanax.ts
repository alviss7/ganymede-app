import { AlmanaxZod } from '@/types/almanax.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export class GetAlmanaxError extends Error {
  static from(error: unknown) {
    return new GetAlmanaxError('Failed to get almanax', { cause: error })
  }
}

export function getAlmanax() {
  return fromPromise(invoke('get_almanax'), GetAlmanaxError.from).map((response) => {
    return AlmanaxZod.parseAsync(response)
  })
}
