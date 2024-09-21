import { setConf } from '@/ipc/conf.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { Conf } from '@/types/conf.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSetConf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conf: Conf) => {
      const result = await setConf(conf)

      if (result.isErr()) {
        throw result.error
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(confQuery)
    },
  })
}
