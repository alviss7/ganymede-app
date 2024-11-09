import { PageContent } from '@/components/page-content.tsx'
import { PageTitle, PageTitleText } from '@/components/page-title.tsx'
import { cn } from '@/lib/utils.ts'
import { BackButtonLink } from '@/routes/downloads/-back-button-link.tsx'
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
}: PropsWithChildren<{
  title: string
  actions?: ReactNode
  className?: string
  pageTitleTextClassName?: string
}> &
  LinkProps<TRouter, TFrom, TTo>) {
  return (
    <PageContent className={cn(className)}>
      <PageTitle>
        <div className="flex w-full items-center gap-2">
          {(to || search || from || hash || state) && (
            <BackButtonLink to={to} search={search} from={from} hash={hash} state={state} />
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
