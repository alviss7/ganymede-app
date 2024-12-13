import { Conf, Profile } from '@/ipc/bindings.ts'

export function getProfile(conf: Conf) {
  return conf.profiles.find((profile) => profile.id === conf.profileInUse) ?? conf.profiles[0]
}

export function getProfileById(profiles: Profile[], id: string) {
  return profiles.find((profile) => profile.id === id)
}

export function getProfileIndexById(profiles: Profile[], id: string) {
  return profiles.findIndex((profile) => profile.id === id)
}
