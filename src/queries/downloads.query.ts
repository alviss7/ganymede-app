import { getDownloadedGuides } from '@/ipc/download.ts'
import { queryOptions } from '@tanstack/react-query'

export const downloadsQuery = queryOptions({
  queryKey: ['conf', 'guides'],
  queryFn: async () => {
    const guides = await getDownloadedGuides()

    if (guides.isErr()) {
      throw guides.error
    }

    return guides.value
  },
})
