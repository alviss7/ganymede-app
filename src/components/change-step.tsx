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
    <div className="-translate-y-1/2 -translate-x-1/2 absolute top-1/2 left-1/2 flex items-center gap-1">
      <Button
        size="icon"
        className="size-8"
        onClick={() => {
          onPrevious()

          if (current === 1) {
            return
          }

          setInnerValue((current - 1).toString())
        }}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex flex-col items-center rounded bg-neutral-900/50 px-1 font-semibold text-neutral-50 text-sm leading-4">
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
        className="size-8"
        onClick={() => {
          onNext()

          if (current === max) {
            return
          }

          setInnerValue((current + 1).toString())
        }}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
