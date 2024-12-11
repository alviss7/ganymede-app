import { PageContent } from '@/components/page-content.tsx'
import { PageTitle, PageTitleText } from '@/components/page-title.tsx'
import { cn } from '@/lib/utils.ts'
import { BackButtonLink } from '@/routes/_app/downloads/-back-button-link'
import { type AnyRouter, LinkProps, type RegisteredRouter, type RoutePaths } from '@tanstack/react-router'
import { PropsWithChildren, ReactNode } from 'react'

export function Page<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
  TTo extends string | undefined = '.',
>({
  title,
  children,
  to,
  search,
  from,
  hash,
  state,
  className,
  actions,
  pageTitleTextClassName,
  disabled,
  removeBackButton = false,
}: PropsWithChildren<{
  title: string
  actions?: ReactNode
  className?: string
  pageTitleTextClassName?: string
  removeBackButton?: boolean
}> &
  LinkProps<TRouter, TFrom, TTo>) {
  return (
    <PageContent className={cn(className)}>
      <PageTitle>
        <div className="flex w-full items-center gap-2">
          {!removeBackButton && (to || search || from || hash || state) && (
            <BackButtonLink to={to} search={search} from={from} hash={hash} state={state} disabled={disabled} />
          )}
          <PageTitleText className={pageTitleTextClassName} title={title}>
            {title}
          </PageTitleText>
          {actions}
        </div>
      </PageTitle>
      {children}
    </PageContent>
  )
}
