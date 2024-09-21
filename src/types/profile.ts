import { z } from 'zod'

export const ProfileZod = z.object({
  id: z.string(),
  name: z.string(),
})

export type Profile = z.infer<typeof ProfileZod>
