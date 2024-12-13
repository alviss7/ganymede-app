import { taurpc } from '@/ipc/ipc.ts'
import { fromPromise } from 'neverthrow'

export class GetGuideFromServerError extends Error {
  static from(error: unknown) {
    return new GetGuideFromServerError('Failed to get guide', { cause: error })
  }
}

export function getGuideFromServer(guideId: number) {
  return fromPromise(taurpc.guides.getGuideFromServer(guideId), GetGuideFromServerError.from)
}
