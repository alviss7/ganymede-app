import { Button } from '@/components/ui/button.tsx'
import { type AnyRouter, Link, type LinkProps, type RegisteredRouter, type RoutePaths } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react'

export function BackButtonLink<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
  TTo extends string | undefined = '.',
>({ to, params, search, from, state, hash }: LinkProps<TRouter, TFrom, TTo>) {
  return (
    <Button size="icon-sm" variant="secondary" asChild>
      <Link to={to} params={params} search={search} from={from} state={state} hash={hash} draggable={false}>
        <ChevronLeftIcon />
      </Link>
    </Button>
  )
}
