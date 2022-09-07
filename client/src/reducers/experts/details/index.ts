import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  EXPERTS_SHOW_MODAL,
  EXPERTS_HIDE_MODAL,
} from '../../../actions/experts/types'


export default createReducer(initialState, {
  [EXPERTS_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [EXPERTS_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),
})
