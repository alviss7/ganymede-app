import { useSuspenseQuery } from '@tanstack/react-query'
import { progressQuery } from '@/queries/progress.query'
import { getStep } from '@/lib/progress'

export function useProgressStep(guideId: number, stepIndex: number) {
  const progress = useSuspenseQuery(progressQuery(guideId))

  return getStep(progress.data, stepIndex)
}
