import { getGuides } from '@/ipc/guides.ts'
import { Status } from '@/types/status.ts'
import { queryOptions } from '@tanstack/react-query'

export const itemsPerPage = 20

export function guidesQuery({ status, page }: { status: Status; page: number }) {
  return queryOptions({
    queryKey: ['guides', status, page],
    queryFn: async () => {
      const result = await getGuides(status)

      if (result.isErr()) {
        throw result.error
      }

      const guides = result.value

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage

      return {
        data: guides.slice(start, end),
        total: guides.length,
      }
    },
  })
}
