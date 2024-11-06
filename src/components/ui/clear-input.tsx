import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from './input'
import { XIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
}

const ClearInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, onValueChange, value, type, ...props }, ref) => {
    return (
      <div className="relative z-0 flex w-full">
        <Input
          data-has-value={value !== ''}
          className={cn('peer focus:outline-none', className)}
          type={type}
          {...props}
          value={value}
          ref={ref}
        />
        <button
          type="button"
          className="-translate-y-1/2 absolute top-1/2 right-2 transform opacity-0 transition-opacity peer-data-[has-value=true]:opacity-100"
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
