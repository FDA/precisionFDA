/* eslint-disable import/no-import-module-exports */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Axios from 'axios'
import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import Root from './root'
import { getAuthenticityToken } from './utils/api'

async function enableMocking() {
  if (!ENABLE_DEV_MSW) {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  // eslint-disable-next-line consistent-return
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
