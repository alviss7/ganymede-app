import { confQuery } from '@/queries/conf.query.ts'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useProfile() {
  const conf = useSuspenseQuery(confQuery)

  return conf.data.profiles.find((profile) => profile.id === conf.data.profileInUse) ?? conf.data.profiles[0]
}
