import { ConfLang } from '@/ipc/bindings.ts'

export function getLang(lang?: ConfLang): ConfLang {
  return lang ?? 'Fr'
}
