import { ConfStep, Profile, Progress } from '@/ipc/bindings.ts'

export function newProgress(guideId: number): Progress {
  return {
    id: guideId,
    currentStep: 0,
    steps: {},
  }
}

export function getProgress(profile: Profile, guideId: number): Progress | undefined {
  return profile.progresses.find((p) => p.id === guideId)
}

export function getStep(progress: Progress, stepIndex: number): ConfStep | undefined {
  return progress.steps[stepIndex]
}
