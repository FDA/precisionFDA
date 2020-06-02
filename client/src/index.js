/* global module process */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'

import Root from './root'
import store from './store'
import './styles/style.sass'


const renderApp = () => {
  let container = document.getElementById('app-root')

  if (container) {
    ReactDOM.render(<Root store={store} />, container)
  }
}

document.addEventListener('DOMContentLoaded', renderApp)
document.addEventListener('page:load', renderApp)

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}
