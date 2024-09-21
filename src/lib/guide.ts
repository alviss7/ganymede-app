import { GuideWithSteps } from '@/types/download.ts'
import { Guide } from '@/types/guide.ts'

/**
 * Check if a guide is new compared to another guide.
 *
 * We use updated_at property, this property is a string in ISO 8601 format. Sometime the date may be null
 * @param guide
 * @param otherGuide
 */
export function isGuideNew(guide?: Guide | GuideWithSteps, otherGuide?: Guide | GuideWithSteps): boolean {
  if (!guide?.updated_at || !otherGuide?.updated_at) {
    return false
  }

  return +guide.updated_at !== +otherGuide.updated_at
}

export function getGuideById<T extends Guide | GuideWithSteps>(guides: T[], id: number): T | undefined {
  return guides.find((guide) => guide.id === id)
}
