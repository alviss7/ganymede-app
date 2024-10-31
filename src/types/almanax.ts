import { z } from 'zod'

export const AlmanaxZod = z.object({
  name: z.string(),
  quantity: z.number(),
  kamas: z.number(),
  experience: z.number(),
  bonus: z.string(),
})
