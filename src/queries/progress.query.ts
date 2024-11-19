import { getProfile } from '@/lib/profile'
import { getProgress, newProgress } from '@/lib/progress'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { confQuery } from './conf.query'

export function progressQuery(guideId: number) {
  const conf = useSuspenseQuery(confQuery)

  return queryOptions({
    queryKey: ['conf', 'progress', guideId],
    queryFn: async () => {
      const profile = getProfile(conf.data)

      return getProgress(profile, guideId) ?? newProgress(guideId)
    },
  })
}
