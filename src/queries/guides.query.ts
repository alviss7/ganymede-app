import { getGuides } from '@/ipc/guides.ts'
import { queryOptions } from '@tanstack/react-query'

export const guidesQuery = queryOptions({
  queryKey: ['conf', 'guides'],
  queryFn: async () => {
    const guides = await getGuides()

    if (guides.isErr()) {
      throw guides.error
    }

    return guides.value
  },
})
