import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as React from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import * as Sentry from '@sentry/browser'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { defaultOptions as sentryDefaultOptions } from 'tauri-plugin-sentry-api'
import { dynamicActiveLocale } from './i18n.ts'
import './main.css'
import { confQuery } from './queries/conf.query.ts'
import { routeTree } from './routeTree.gen.ts'

function sendBreadcrumbToRust(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
  // Ignore IPC breadcrumbs otherwise we'll make an infinite loop
  if (
    typeof breadcrumb.data?.url === 'string' &&
    (breadcrumb.data.url.startsWith('ipc://') ||
      breadcrumb.data.url.startsWith('tauri://') ||
      breadcrumb.data.url.startsWith('http://ipc.localhost'))
  ) {
    return null
  }

  invoke('plugin:sentry|breadcrumb', { breadcrumb })
  // We don't collect breadcrumbs in the renderer since they are passed to Rust
  return null
}

Sentry.init({
  ...sentryDefaultOptions,
  autoSessionTracking: false,
  beforeBreadcrumb: sendBreadcrumbToRust,
})

if (
  (window.location.hostname === 'localhost' && window.location.port === '') ||
  (window.location.hostname === 'tauri.localhost' && window.location.port === '')
) {
  document.addEventListener(
    'contextmenu',
    (evt) => {
      evt.preventDefault()

      return false
    },
    { capture: true },
  )

  document.addEventListener(
    'selectstart',
    (evt) => {
      evt.preventDefault()

      return false
    },
    { capture: true },
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnMount: true,
    },
  },
})

const conf = await queryClient.ensureQueryData(confQuery)

window.document.documentElement.style.setProperty('--opacity', `${conf.opacity.toFixed(2)}`)

await dynamicActiveLocale(conf.lang.toLowerCase())

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </I18nProvider>
    </React.StrictMode>,
  )
}
