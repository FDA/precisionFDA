/* global module process */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'

import Root from './root'
import store from './store'
import './styles/style.sass'
import { getAuthenticityToken } from './utils/api'

Axios.defaults.headers.common['X-CSRF-Token'] = getAuthenticityToken()

const renderApp = () => {
  let container = document.getElementById('app-root')

  if (container) {
    ReactModal.setAppElement('#app-root')
    ReactDOM.render(<Root store={store} />, container)
  }
}

document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}
