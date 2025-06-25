import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'

import Axios from 'axios'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import Root from './root'
import { getAuthenticityToken } from './utils/api'

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

Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()

const renderApp = () => {
  const container = document.getElementById('app-root')
  const root = createRoot(container!)

  if (container) {
    ReactModal.setAppElement('#app-root')
    enableMocking().then(() => {
      root.render(<Root />)
    })
  }
}
  document.addEventListener('DOMContentLoaded', renderApp)
  document.addEventListener('page:load', renderApp)

if (NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}
