import { ProfileZod } from '@/types/profile.ts'
import { z } from 'zod'

export const ConfZod = z.object({
  autoTravelCopy: z.boolean().default(true),
  showDoneGuides: z.boolean().default(true),
  lang: z.enum(['En', 'Fr', 'Es', 'Pt']).default('Fr'),
  fontSize: z.enum(['Small', 'Base', 'Large', 'Extra']).default('Base'),
  profiles: z.array(ProfileZod),
  profileInUse: z.string(),
  autoPilots: z.array(
    z.object({
      name: z.string(),
      position: z.string(),
    }),
  ),
})

export type Conf = z.infer<typeof ConfZod>

export type Lang = Conf['lang']

export type FontSize = Conf['fontSize']

export type AutoPilot = Conf['autoPilots'][number]
