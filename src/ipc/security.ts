import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

class CannotGetWhiteListError extends Error {
  static from(err: unknown) {
    return new CannotGetWhiteListError('cannot get white list', { cause: err })
  }
}

export function getWhiteList() {
  return fromPromise(taurpc.security.getWhiteList(), CannotGetWhiteListError.from)
}
