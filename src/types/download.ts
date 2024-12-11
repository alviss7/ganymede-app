import { GuideZod } from '@/types/guide.ts'
import { StepZod } from '@/types/step.ts'
import { z } from 'zod'

export const GuideWithStepsZod = GuideZod.omit({
  user_id: true,
  created_at: true,
  downloads: true,
}).extend({
  steps: z.array(StepZod),
  folder: z
    .string()
    .nullable()
    .transform((val) => val || ''),
})

export const FolderZod = z.object({
  type: z.literal('folder'),
  name: z.string(),
})

export const GuideWithStepsWithTypeZod = GuideWithStepsZod.extend({
  type: z.literal('guide'),
})

export const GuideInFolder = z.array(z.discriminatedUnion('type', [GuideWithStepsWithTypeZod, FolderZod]))

export const GuidesZod = z.array(GuideWithStepsZod)

export type Download = z.infer<typeof GuidesZod>

export type GuideWithSteps = z.infer<typeof GuideWithStepsZod>

export type GuideInFolder = z.infer<typeof GuideInFolder>

export type GuideWithStepsWithType = z.infer<typeof GuideWithStepsWithTypeZod>

export type Folder = z.infer<typeof FolderZod>
