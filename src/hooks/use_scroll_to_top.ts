import { type RefObject, useLayoutEffect } from 'react'

export function useScrollToTop(ref: RefObject<HTMLElement>, deps: unknown[]) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useLayoutEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, deps)
}
