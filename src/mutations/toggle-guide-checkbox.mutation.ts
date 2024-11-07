import { toggleGuideCheckbox } from '@/ipc/guides.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confQuery } from '@/queries/conf.query'
import { getProfile } from '@/lib/profile'
import { getProgress } from '@/lib/progress'

export function useToggleGuideCheckbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guideId,
      checkboxIndex,
      stepIndex,
    }: {
      guideId: number
      checkboxIndex: number
      stepIndex: number
    }) => {
      console.log('toggle', guideId, checkboxIndex, stepIndex)
      const result = await toggleGuideCheckbox(guideId, checkboxIndex, stepIndex)

      if (result.isErr()) {
        throw result.error
      }
    },
    onMutate({ guideId, checkboxIndex, stepIndex }) {
      const conf = queryClient.getQueryData(confQuery['queryKey'])!
      const baseConf = { ...conf }

      const profile = getProfile(conf)
      const progress = getProgress(profile, guideId)

      const step = progress.steps[stepIndex] ?? { checkboxes: [] }

      const checkbox = step.checkboxes.find((i) => i === checkboxIndex)

      if (checkbox === undefined) {
        step.checkboxes.push(checkboxIndex)
      } else {
        step.checkboxes = step.checkboxes.filter((i) => {
          return i !== checkbox
        })
      }

      progress.steps[stepIndex] = step

      profile.progresses.map((p) => {
        if (p.id === guideId) {
          p = progress
        }

        return p
      })

      conf.profiles.map((p) => {
        if (p.id === conf.profileInUse) {
          p = profile
        }

        return p
      })

      queryClient.setQueryData(confQuery['queryKey'], () => conf)

      return baseConf
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(confQuery)
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(confQuery['queryKey'], context)
    },
  })
}
