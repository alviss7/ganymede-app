import { openGuideLink } from '@/ipc/guides.ts'
import { useMutation } from '@tanstack/react-query'

export function useOpenGuideLink() {
  return useMutation({
    mutationFn: async (href: string) => {
      const result = await openGuideLink(href)

      if (result.isErr()) {
        throw result.error
      }
    },
  })
}
