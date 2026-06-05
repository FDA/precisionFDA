import Axios from 'axios'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import { ENABLE_DEV_MSW } from '@/utils/env'
import { loadRuntimeEnv } from '@/utils/runtimeEnv'
import './styles/tailwind.css'
import './styles/variables.css'
import './styles/app-globals.css'
import { applyPageMeta } from '@/lib/pageMeta'
import Root from './routes/root'
import { getCsrfToken } from './utils/csrf'

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

Axios.interceptors.request.use(async config => {
  const method = config.method?.toLowerCase()
  if (method && !['get', 'head', 'options'].includes(method)) {
    const token = await getCsrfToken()
    if (token) {
      config.headers['X-CSRF-Token'] = token
    }
  }
  return config
})

const renderApp = () => {
  applyPageMeta()

  const container = document.getElementById('app-root')
  if (!container) {
    return
  }

  const root = createRoot(container)
  ReactModal.setAppElement('#app-root')
  loadRuntimeEnv().then(() => {
    getCsrfToken().then(() => {
      enableMocking().then(() => {
        root.render(<Root />)
      })
    })
  })
}
document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)
