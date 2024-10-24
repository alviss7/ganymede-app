import { getAlmanax } from '@/ipc/almanax.ts'
import { queryOptions } from '@tanstack/react-query'

export const almanaxQuery = queryOptions({
  queryKey: ['almanax'],
  queryFn: async () => {
    const res = await getAlmanax()

    if (res.isErr()) {
      throw res.error
    }

    return res.value
  },
})
