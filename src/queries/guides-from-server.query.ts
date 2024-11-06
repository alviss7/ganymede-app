import { getGuidesFromServer } from '@/ipc/guides_from_server.ts'
import { Status } from '@/types/status.ts'
import { queryOptions } from '@tanstack/react-query'

export const itemsPerPage = 20

export function guidesFromServerQuery({ status }: { status: Status }) {
  return queryOptions({
    queryKey: ['guides', 'from_server', status],
    queryFn: async () => {
      const result = await getGuidesFromServer(status)

      if (result.isErr()) {
        throw result.error
      }

      const guides = result.value

      return guides
    },
    staleTime: 1000 * 60,
  })
}
