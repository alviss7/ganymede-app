import { Conf, ConfZod } from '@/types/conf.ts'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export class GetConfError extends Error {
  static from(error: unknown) {
    return new GetConfError('Failed to get conf', { cause: error })
  }
}

export class SetConfError extends Error {
  static from(error: unknown) {
    return new SetConfError('Failed to set conf', { cause: error })
  }
}

export class ResetConfError extends Error {
  static from(error: unknown) {
    return new ResetConfError('Failed to reset conf', { cause: error })
  }
}

export function getConf() {
  return fromPromise(invoke('get_conf'), GetConfError.from).map((response) => {
    return ConfZod.parseAsync(response)
  })
}

export async function setConf(conf: Conf) {
  return fromPromise(invoke('set_conf', { conf }), SetConfError.from)
}

export async function resetConf() {
  return fromPromise(invoke('reset_conf'), ResetConfError.from)
}
