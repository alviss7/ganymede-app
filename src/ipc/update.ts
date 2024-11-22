import { invoke } from '@tauri-apps/api/core'
import { fromPromise, ResultAsync } from 'neverthrow'

class StartUpdateError extends Error {
  static from(err: unknown) {
    return new StartUpdateError('Cannot start update', { cause: err })
  }
}

export function startUpdate(): ResultAsync<void, StartUpdateError> {
  return fromPromise(invoke('start_update'), StartUpdateError.from)
}
