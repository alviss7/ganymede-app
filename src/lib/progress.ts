import { GuideProgress, Profile } from '@/types/profile'

export function newProgress(guideId: number): GuideProgress {
  return {
    id: guideId,
    currentStep: 0,
    steps: {},
  }
}

export function getProgress(profile: Profile, guideId: number): GuideProgress | undefined {
  return profile.progresses.find((p) => p.id === guideId)
}

export function getStep(progress: GuideProgress, stepIndex: number): GuideProgress['steps'][number] | undefined {
  return progress.steps[stepIndex]
}
