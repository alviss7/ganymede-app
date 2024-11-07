import { Conf } from '@/types/conf'

export function getProfile(conf: Conf) {
  return conf.profiles.find((profile) => profile.id === conf.profileInUse) ?? conf.profiles[0]
}
