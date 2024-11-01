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
  // staleTime today until midnight in ms, if it's 8 pm, it will gc in 4 hours, etc
  staleTime: new Date().setHours(24, 0, 0, 0) - Date.now(),
})
