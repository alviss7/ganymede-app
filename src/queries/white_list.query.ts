import { getWhiteList } from '@/ipc/security.ts'
import { queryOptions } from '@tanstack/react-query'

export const whiteListQuery = queryOptions({
  queryKey: ['white_list'],
  queryFn: async () => {
    const res = await getWhiteList()

    if (res.isErr()) {
      throw res.error
    }

    return res.value
  },
  staleTime: Infinity,
})
