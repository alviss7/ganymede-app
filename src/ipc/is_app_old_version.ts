import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

class GetIsAppOldVersionError extends Error {
  static from(err: unknown) {
    return new GetIsAppOldVersionError('Cannot get is old version', { cause: err })
  }
}

export function isAppOldVersion() {
  return fromPromise(taurpc.isAppVersionOld(), GetIsAppOldVersionError.from)
}
