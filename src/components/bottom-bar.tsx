import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { ComponentProps } from 'react'

export function BottomBar({
  asChild = false,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      className={cn(
        'fixed inset-x-0 bottom-0 flex h-[52px] gap-2 bg-primary px-6 py-2 text-primary-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
