import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'

import Axios from 'axios'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import Root from './root'
import { getAuthenticityToken } from './utils/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

async function enableMocking() {
  if (!process.env.ENABLE_DEV_MSW) {
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

const queryClient = new QueryClient()

async function initializeApp() {
  try {
    // Only prefetch if we have auth token
    const authToken = getAuthenticityToken()
    if (authToken) {
      await queryClient.prefetchQuery({
        queryKey: ['auth-user'],
        queryFn: () => Axios.get('/api/user').then(r => r.data),
      })
    }
  } catch (error) {
    console.log('Auth prefetch failed:', error)
    // Don't block app initialization on auth failure
  }
}
Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()

const renderApp = () => {
  const container = document.getElementById('app-root')
  const root = createRoot(container!)

  if (container) {
    ReactModal.setAppElement('#app-root')
    enableMocking().then(() => {
      initializeApp().then(() => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <Root />
          </QueryClientProvider>,
        )
      })
    })
  }
}
document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)

if (NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}
