import { GuideProgress, Profile } from '@/types/profile'

export function getProgress(profile: Profile, guideId: number) {
  return (
    profile.progresses.find((p) => p.id === guideId) ?? {
      id: guideId,
      currentStep: 0,
      steps: {},
    }
  )
}

export function getStep(progress: GuideProgress, stepIndex: number) {
  return progress.steps[stepIndex] ?? { checkboxes: [] }
}
