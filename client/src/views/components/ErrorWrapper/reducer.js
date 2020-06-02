import { createReducer } from '@reduxjs/toolkit'

import { setErrorPage, clearErrorPage } from './actions'


export default createReducer({ page: null }, {
  [setErrorPage]: (state, { payload }) => {
    state.page = payload
  },

  [clearErrorPage]: (state) => {
    state.page = null
  },
})
