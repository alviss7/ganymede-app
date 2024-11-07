import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getProgress } from '@/lib/progress'
import { confQuery } from './conf.query'
import { getProfile } from '@/lib/profile'

export function progressQuery(guideId: number) {
  const conf = useSuspenseQuery(confQuery)

  return queryOptions({
    queryKey: ['conf', 'progress', guideId],
    queryFn: async () => {
      const profile = getProfile(conf.data)

      return getProgress(profile, guideId)
    },
  })
}
