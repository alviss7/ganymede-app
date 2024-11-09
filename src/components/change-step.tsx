import { Button } from '@/components/ui/button.tsx'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ChangeStep({
  currentIndex,
  maxIndex,
  onPrevious,
  onNext,
  setCurrentIndex,
}: {
  currentIndex: number
  maxIndex: number
  onPrevious: () => Promise<boolean>
  onNext: () => Promise<boolean>
  setCurrentIndex: (index: number) => Promise<void>
}) {
  const current = currentIndex + 1
  const [innerValue, setInnerValue] = useState(current.toString())
  const [hadLostFocus, setHadLostFocus] = useState(true)

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need for innerValue
  useEffect(() => {
    if (innerValue !== current.toString()) {
      setInnerValue(current.toString())
    }
  }, [current])

  return (
    <div className="center-absolute flex items-center gap-1">
      <Button
        size="icon"
        variant="secondary"
        className="size-8"
        onClick={async () => {
          const canMove = await onPrevious()

          if (!canMove) {
            return
          }

          setInnerValue((current - 1).toString())
        }}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex flex-col items-center rounded bg-primary px-1 font-semibold text-primary-foreground text-sm leading-4">
        <form
          onSubmit={async (evt) => {
            evt.preventDefault()

            const data = new FormData(evt.currentTarget)
            const value = data.get('current') as string

            if (value === '') {
              return
            }

            const number = parseInt(value)

            if (Number.isNaN(number) || number < 1) {
              return
            }

            const numberIndex = number - 1
            const nextStepIndex = numberIndex > maxIndex ? maxIndex : numberIndex

            await setCurrentIndex(nextStepIndex)

            setInnerValue((nextStepIndex + 1).toString())
          }}
        >
          <input
            name="current"
            value={innerValue}
            inputMode="numeric"
            onChange={(evt) => {
              const value = evt.currentTarget.value

              setInnerValue(value)
            }}
            className="w-8 bg-transparent text-center outline-none"
            onBlur={() => {
              setHadLostFocus(true)
            }}
            onClick={(evt) => {
              const input = evt.currentTarget

              if (hadLostFocus) {
                input.select()
                setHadLostFocus(false)
              }
            }}
          />
        </form>
        <span>{maxIndex + 1}</span>
      </div>
      <Button
        size="icon"
        variant="secondary"
        className="size-8"
        onClick={async () => {
          const canMove = await onNext()

          if (!canMove) {
            return
          }

          setInnerValue((current + 1).toString())
        }}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
