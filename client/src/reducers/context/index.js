import initialState from './initialState'
import { createReducer } from '../../utils/redux'
import {
  CONTEXT_FETCH_FAILURE,
  CONTEXT_FETCH_START,
  CONTEXT_FETCH_SUCCESS,
} from '../../actions/context/types'


export default createReducer(initialState, {
  [CONTEXT_FETCH_START]: (state) => ({
    ...state,
    isFetching: true,
    isInitialized: false,
  }),

  [CONTEXT_FETCH_SUCCESS]: (state, { user, meta }) => ({
    ...state,
    user: {
      ...state.user,
      ...user,
    },
    links: {
      ...state.links,
      ...meta.links,
    },
    isFetching: false,
    isInitialized: true,
  }),

  [CONTEXT_FETCH_FAILURE]: (state) => ({
    ...state,
    isFetching: false,
    isInitialized: false,
  }),
})
