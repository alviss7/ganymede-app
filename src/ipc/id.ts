import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

export function newId() {
  return fromPromise(taurpc.base.newId(), (error) => new Error('Failed to generate new id', { cause: error }))
}
