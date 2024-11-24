import { resetConf } from '@/ipc/conf.ts'
import { useMutation } from '@tanstack/react-query'

export function useResetConf() {
  return useMutation({
    mutationFn: async () => {
      const result = await resetConf()

      if (result.isErr()) {
        throw result.error
      }
    },
  })
}
