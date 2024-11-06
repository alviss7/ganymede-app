import { Button } from '@/components/ui/button.tsx'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'

export function ChangeStep({
  current,
  max,
  onPrevious,
  onNext,
  setCurrent,
}: {
  current: number
  max: number
  onPrevious: () => void
  onNext: () => void
  setCurrent: (current: number) => Promise<number>
}) {
  const [innerValue, setInnerValue] = useState(current.toString())

  return (
    <div className="center-absolute flex items-center gap-1">
      <Button
        size="icon"
        variant="secondary"
        className="size-8"
        onClick={() => {
          onPrevious()

          if (current === 1) {
            return
          }

          setInnerValue((current - 1).toString())
        }}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex flex-col items-center rounded bg-primary px-1 font-semibold text-neutral-50 text-sm leading-4">
        <form
          onSubmit={async (evt) => {
            evt.preventDefault()

            const data = new FormData(evt.currentTarget)
            const value = data.get('current') as string

            if (value === '') {
              return
            }

            const number = parseInt(value)

            if (isNaN(number) || number < 1) {
              return
            }

            const newValue = await setCurrent(number > max ? max : number)

            setInnerValue((newValue + 1).toString())
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
          />
        </form>
        <span>{max}</span>
      </div>
      <Button
        size="icon"
        variant="secondary"
        className="size-8"
        onClick={() => {
          onNext()

          if (current === max) {
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
