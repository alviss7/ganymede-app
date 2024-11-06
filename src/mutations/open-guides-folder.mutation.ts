import { openGuidesFolder } from '@/ipc/guides.ts'
import { useMutation } from '@tanstack/react-query'

export function useOpenGuidesFolder() {
  return useMutation({
    mutationFn: async () => {
      const result = await openGuidesFolder()

      if (result.isErr()) {
        throw result.error
      }
    },
  })
}
