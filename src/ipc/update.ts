import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

class StartUpdateError extends Error {
  static from(err: unknown) {
    return new StartUpdateError('Cannot start update', { cause: err })
  }
}

export function startUpdate() {
  return fromPromise(taurpc.update.startUpdate(), StartUpdateError.from)
}
