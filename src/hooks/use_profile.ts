import { confQuery } from '@/queries/conf.query.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/profile'

export function useProfile() {
  const conf = useSuspenseQuery(confQuery)

  return getProfile(conf.data)
}
