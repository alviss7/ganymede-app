import { Status } from '@/ipc/bindings.ts'
import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

export class GetGuidesFromServerError extends Error {
  static from(error: unknown) {
    return new GetGuidesFromServerError('Failed to get guides', { cause: error })
  }
}

export function getGuidesFromServer(status: Status) {
  return fromPromise(taurpc.guides.getGuidesFromServer(status), GetGuidesFromServerError.from)
}
