import { GuideWithStepsZod } from '@/types/download'
import { invoke } from '@tauri-apps/api/core'
import { fromPromise } from 'neverthrow'

export class GetGuideFromServerError extends Error {
  static from(error: unknown) {
    return new GetGuideFromServerError('Failed to get guide', { cause: error })
  }
}

export function getGuideFromServer(guideId: number) {
  return fromPromise(invoke('get_guide_from_server', { guideId }), GetGuideFromServerError.from).map((res) => {
    return GuideWithStepsZod.parseAsync(res)
  })
}
