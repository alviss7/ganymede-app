import { downloadGuideFromServer } from '@/ipc/guides.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Guide } from '@/types/guide.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDownloadGuideFromServer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guide,
      folder,
    }: {
      guide: Pick<Guide, 'id'>
      folder: string
    }) => {
      const result = await downloadGuideFromServer(guide.id, folder)

      if (result.isErr()) {
        throw result.error
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(guidesQuery())
    },
  })
}
