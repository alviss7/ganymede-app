import { getGuidesFromServer } from '@/ipc/guides_from_server.ts'
import { Status } from '@/types/status.ts'
import { queryOptions } from '@tanstack/react-query'

export const itemsPerPage = 20

export function guidesFromServerQuery({ status, page }: { status: Status; page: number }) {
  return queryOptions({
    queryKey: ['guides', 'from_server', status, page],
    queryFn: async () => {
      console.log('guidesFromServerQuery', 'start', new Date().toISOString())
      const result = await getGuidesFromServer(status)

      if (result.isErr()) {
        throw result.error
      }

      const guides = result.value

      const start = (page - 1) * itemsPerPage
      const end = page * itemsPerPage

      console.log('guidesFromServerQuery', 'end', new Date().toISOString())

      return {
        data: guides.slice(start, end),
        total: guides.length,
      }
    },
  })
}
