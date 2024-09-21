import { invoke } from '@tauri-apps/api/core'
import { ResultAsync } from 'neverthrow'

export function newId() {
  return ResultAsync.fromThrowable(
    () => invoke<string>('new_id'),
    (error) => new Error('Failed to generate new id', { cause: error }),
  )()
}
