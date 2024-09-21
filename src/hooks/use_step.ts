import { GuideWithSteps } from '@/types/download.ts'
import { Profile } from '@/types/profile.ts'

export function useStep({
  guide,
  profile,
}: {
  guide: GuideWithSteps
  profile: Profile
}) {
  const progress = profile.progresses.find((p) => p.id === guide.id)

  if (!progress) {
    return {
      step: guide.steps.at(0),
      index: 0,
    }
  }

  return {
    step: guide.steps.at(progress.step),
    index: progress.step,
  }
}
