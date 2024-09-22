import { Button } from '@/components/ui/button.tsx'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export function ChangeStep({
  current,
  max,
  onPrevious,
  onNext,
}: {
  current: number
  max: number
  onPrevious?: () => void
  onNext?: () => void
}) {
  return (
    <div className="-translate-y-1/2 -translate-x-1/2 absolute top-1/2 left-1/2 flex items-center gap-1">
      <Button size="icon" className="size-8" onClick={onPrevious}>
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex flex-col items-center rounded bg-neutral-900/50 px-1 font-semibold text-neutral-50 text-sm leading-4">
        {/* TODO: can change the current with an input field */}
        <span>{current}</span>
        <span>{max}</span>
      </div>
      <Button size="icon" className="size-8" onClick={onNext}>
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
