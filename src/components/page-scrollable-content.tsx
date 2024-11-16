import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function PageScrollableContent({
  children,
  hasPageContentTitleBar = false,
  hasBottomBar = false,
  className,
  ...props
}: ComponentProps<'div'> & {
  hasPageContentTitleBar?: boolean
  hasBottomBar?: boolean
}) {
  return (
    <div
      className={cn(
        'scroller flex flex-col overflow-x-hidden overflow-y-scroll pb-2',
        hasPageContentTitleBar && 'mt-[calc(40px)] h-[calc(100vh-30px-36px-40px)]',
        !hasPageContentTitleBar && 'h-[calc(100vh-30px-36px)]',
        hasBottomBar && 'mb-[52px] h-[calc(100vh-30px-36px-52px)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
