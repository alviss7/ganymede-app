import { z } from 'zod'

export const StepZod = z.object({
  name: z.string().nullable().optional(),
  map: z.string(),
  pos_x: z.number(),
  pos_y: z.number(),
  web_text: z.string(),
})

export type Step = z.infer<typeof StepZod>
