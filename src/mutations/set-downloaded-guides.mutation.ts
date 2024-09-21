import { downloadGuide } from '@/ipc/download.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { downloadsQuery } from '@/queries/downloads.query.ts'
import { Guide } from '@/types/guide.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDownloadGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (guide: Guide) => {
      const result = await downloadGuide(guide.id)

      if (result.isErr()) {
        throw result.error
      }

      await queryClient.invalidateQueries(downloadsQuery)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(confQuery)
    },
  })
}
