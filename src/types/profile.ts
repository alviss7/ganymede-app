import { z } from 'zod'

export const GuideProgressZod = z.object({
  id: z.number(),
  step: z.number(),
})

export const ProfileZod = z.object({
  id: z.string(),
  name: z.string(),
  progresses: z.array(GuideProgressZod),
})

export type GuideProgress = z.infer<typeof GuideProgressZod>
export type Profile = z.infer<typeof ProfileZod>
