import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

class CannotGetWhiteListError extends Error {
  static from(err: unknown) {
    return new CannotGetWhiteListError('cannot get white list', { cause: err })
  }
}

export function getWhiteList() {
  return fromPromise(invoke<string[]>('get_white_list'), CannotGetWhiteListError.from)
}
