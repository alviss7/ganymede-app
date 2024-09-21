import { GuideZod } from '@/types/guide.ts'
import { z } from 'zod'

export const DownloadGuideZod = GuideZod.omit({
  user_id: true,
  created_at: true,
  downloads: true,
})

export const DownloadZod = z.object({
  downloaded_guides: z.array(DownloadGuideZod),
})

export type Download = z.infer<typeof DownloadZod>

export type DownloadGuide = z.infer<typeof DownloadGuideZod>
