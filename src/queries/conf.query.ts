import { getConf, GetConfError } from '@/ipc/conf.ts'
import { Conf } from '@/types/conf'
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
