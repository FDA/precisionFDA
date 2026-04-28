import Axios from 'axios'
import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import { ENABLE_DEV_MSW } from '@/utils/env'
import { loadRuntimeEnv } from '@/utils/runtimeEnv'
import './styles/tailwind.css'
import './styles/variables.css'
import './styles/app-globals.css'
import Root from './routes/root'
import { getAuthenticityToken } from './utils/api'

const DevInspector = import.meta.env.DEV
  ? lazy(() => import('react-dev-inspector').then(mod => ({ default: mod.Inspector })))
  : null

async function enableMocking() {
  if (!ENABLE_DEV_MSW) {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  })
}

Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()

const renderApp = () => {
  const container = document.getElementById('app-root')
  const root = createRoot(container!)

  if (container) {
    ReactModal.setAppElement('#app-root')
    loadRuntimeEnv().then(() => {
      enableMocking().then(() => {
        root.render(
          <>
            {DevInspector ? (
              <Suspense fallback={null}>
                <DevInspector />
              </Suspense>
            ) : null}
            <Root />
          </>,
        )
      })
    })
  }
}
document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)
