import { downloadGuideFromServer } from '@/ipc/guides.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Guide } from '@/types/guide.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDownloadGuideFromServer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (guide: Pick<Guide, 'id'>) => {
      const result = await downloadGuideFromServer(guide.id)

      if (result.isErr()) {
        throw result.error
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(guidesQuery)
    },
  })
}
