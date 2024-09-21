import { getAvailableGuides } from '@/ipc/guides.ts'
import { Status } from '@/types/status.ts'
import { queryOptions } from '@tanstack/react-query'

export const itemsPerPage = 20

export function availableGuidesQuery({ status, page }: { status: Status; page: number }) {
  return queryOptions({
    queryKey: ['guides', 'available', status, page],
    queryFn: async () => {
      const result = await getAvailableGuides(status)

      if (result.isErr()) {
        throw result.error
      }

      const guides = result.value

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage

      console.log(guides.slice(start, end), page)

      return {
        data: guides.slice(start, end),
        total: guides.length,
      }
    },
  })
}
