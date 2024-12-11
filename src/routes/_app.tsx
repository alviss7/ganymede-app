import { isAppOldVersionQuery } from '@/queries/is_old_version.query'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { info } from '@tauri-apps/plugin-log'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const isOldVersion = await queryClient.ensureQueryData(isAppOldVersionQuery)

    if (isOldVersion) {
      await info('App is old version')

      throw redirect({
        to: '/app-old-version',
      })
    }
  },
  component: () => <Outlet />,
})
