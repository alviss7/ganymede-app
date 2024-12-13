import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

export class GetAlmanaxError extends Error {
  static from(error: unknown) {
    return new GetAlmanaxError('Failed to get almanax', { cause: error })
  }
}

export function getAlmanax() {
  return fromPromise(taurpc.almanax.get(), GetAlmanaxError.from)
}
