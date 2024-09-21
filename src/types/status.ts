import { z } from 'zod'

export const StatusZod = z.enum(['public', 'gp', 'certified', 'draft', 'private'])

export type Status = z.infer<typeof StatusZod>
