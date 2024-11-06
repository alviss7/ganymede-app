import { rankItem } from '@tanstack/match-sorter-utils'

/**
 * Rank a list of items based on a term and sort them by rank
 */
// biome-ignore lint/suspicious/noExplicitAny: needed any
export function rankList<T extends Record<any, unknown>>(list: T[], keys: ((item: T) => string)[], term: string): T[] {
  return [...list]
    .map(
      (item) =>
        [
          item,
          rankItem(item, term, {
            accessors: keys,
          }),
        ] as const,
    )
    .filter(([, rank]) => rank.passed)
    .sort(([, a], [, b]) => (a.rank > b.rank ? -1 : 1))
    .map(([item]) => item)
}
