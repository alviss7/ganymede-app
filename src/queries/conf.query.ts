import { getConf } from '@/ipc/conf.ts'
import { queryOptions } from '@tanstack/react-query'

export const confQuery = queryOptions({
  queryKey: ['conf'],
  queryFn: async () => {
    const conf = await getConf()

    if (conf.isErr()) {
      throw conf.error
    }

    return conf.value
  },
})
