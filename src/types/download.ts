import { GuideZod } from '@/types/guide.ts'
import { StepZod } from '@/types/step.ts'
import { z } from 'zod'

export const GuideWithStepsZod = GuideZod.omit({
  user_id: true,
  created_at: true,
  downloads: true,
}).extend({
  steps: z.array(StepZod),
})

export const DownloadZod = z.object({
  downloaded_guides: z.array(GuideWithStepsZod),
})

export type Download = z.infer<typeof DownloadZod>

export type GuideWithSteps = z.infer<typeof GuideWithStepsZod>
