import * as React from 'react'

import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import { Input } from './input'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
}

const ClearInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, onValueChange, value, type, ...props }, ref) => {
    return (
      <div className="relative z-0 flex w-full">
        <Input className={cn('peer', className)} type={type} {...props} value={value} ref={ref} />
        <button
          type="button"
          className="center-y-absolute right-2 opacity-0 transition-opacity peer-has-value:opacity-100"
          onClick={() => {
            onValueChange?.('')
          }}
        >
          <XIcon className="size-4" />
        </button>
      </div>
    )
  },
)
ClearInput.displayName = 'Input'

export { ClearInput }
