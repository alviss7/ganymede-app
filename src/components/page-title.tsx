import { cn } from '@/lib/utils.ts'
import { ComponentProps, PropsWithChildren } from 'react'

export function PageTitle({ children }: PropsWithChildren) {
  return (
    <h2 className="sticky top-[30px] z-1 flex w-full items-center justify-between bg-gray-500 p-1 font-semibold">
      {children}
    </h2>
  )
}

export function PageTitleText({ children, className, ...props }: ComponentProps<'span'>) {
  return (
    <span className={cn('text-lg', className)} {...props}>
      {children}
    </span>
  )
}

export function PageTitleExtra({ children, className, ...props }: ComponentProps<'span'>) {
  return (
    <span className={cn('text-xs', className)} {...props}>
      {children}
    </span>
  )
}
