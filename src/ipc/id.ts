import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export function newId() {
  return fromPromise(invoke<string>('new_id'), (error) => new Error('Failed to generate new id', { cause: error }))
}
