import { Conf } from '@/ipc/bindings.ts'
import { GetConfError, getConf } from '@/ipc/conf.ts'
import { queryOptions } from '@tanstack/react-query'

export const confQuery = queryOptions<Conf, GetConfError>({
  queryKey: ['conf'],
  queryFn: async () => {
    const conf = await getConf()

    if (conf.isErr()) {
      throw conf.error
    }

    return conf.value
  },
})
