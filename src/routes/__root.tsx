import { TitleBar } from '@/components/title-bar'
import { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: Root,
})

function Root() {
  return (
    <>
      <TitleBar />
      <Outlet />
    </>
  )
}
