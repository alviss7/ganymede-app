import { StatusZod } from '@/types/status.ts'
import { z } from 'zod'

export const GuideZod = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  status: StatusZod,
  lang: z.string(),
  description: z.string().nullable(),
  web_description: z.string().nullable(),
  likes: z.number(),
  dislikes: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable(),
  downloads: z.number().nullable(),
  order: z.number(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    is_admin: z.number(),
    is_certified: z.number(),
  }),
})

export type Guide = z.infer<typeof GuideZod>

export type User = Guide['user']
