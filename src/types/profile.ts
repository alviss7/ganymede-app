import { z } from 'zod'

export const GuideProgressZod = z.object({
  // guideId
  id: z.number(),
  currentStep: z.number(),
  steps: z.record(
    z.object({
      checkboxes: z.array(z.number()),
    }),
  ),
})

export const ProfileZod = z.object({
  id: z.string(),
  name: z.string(),
  progresses: z.array(GuideProgressZod),
})

export type GuideProgress = z.infer<typeof GuideProgressZod>
export type Profile = z.infer<typeof ProfileZod>
