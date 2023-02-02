/* eslint-disable import/no-import-module-exports */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Axios from 'axios'
import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import Root from './root'
import { getAuthenticityToken } from './utils/api'

Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()

const renderApp = () => {
  const container = document.getElementById('app-root')
  const root = createRoot(container!)

  if (container) {
    ReactModal.setAppElement('#app-root')
    root.render(<Root />)
  }
}

document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)

if (NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}
