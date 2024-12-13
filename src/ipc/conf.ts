import { Conf } from '@/ipc/bindings.ts'
import { taurpc } from '@/ipc/ipc.ts'
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

export class ToggleGuideCheckboxError extends Error {
  static from(error: unknown) {
    return new ToggleGuideCheckboxError('Failed to toggle checkbox guide', { cause: error })
  }
}

export function getConf() {
  return fromPromise(taurpc.conf.get(), GetConfError.from)
}

export async function setConf(conf: Conf) {
  return fromPromise(taurpc.conf.set(conf), SetConfError.from)
}

export async function resetConf() {
  return fromPromise(taurpc.conf.reset(), ResetConfError.from)
}

export function toggleGuideCheckbox(guideId: number, checkboxIndex: number, stepIndex: number) {
  return fromPromise(taurpc.conf.toggleGuideCheckbox(guideId, stepIndex, checkboxIndex), ToggleGuideCheckboxError.from)
}
