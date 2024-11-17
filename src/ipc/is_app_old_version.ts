import { invoke } from '@tauri-apps/api/core'
import { fromPromise, ResultAsync } from 'neverthrow'

class GetIsAppOldVersionError extends Error {
  static from(err: unknown) {
    return new GetIsAppOldVersionError('Cannot get is old version', { cause: err })
  }
}

export function isAppOldVersion(): ResultAsync<boolean, GetIsAppOldVersionError> {
  return fromPromise(invoke<boolean>('is_app_version_old'), GetIsAppOldVersionError.from)
}
