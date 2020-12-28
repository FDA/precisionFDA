import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
    CHALLENGE_FETCH_START,
    CHALLENGE_FETCH_SUCCESS,
    CHALLENGE_FETCH_FAILURE,
} from '../../../actions/challenges/types'


export default createReducer(initialState, {
    [CHALLENGE_FETCH_START]: state => ({
      ...state,
      isFetching: true,
    }),
  
    [CHALLENGE_FETCH_SUCCESS]: (state, challenge) => ({
      ...state,
      data: { ...challenge },
      isFetching: false,
    }),

    [CHALLENGE_FETCH_FAILURE]: (state, error) => ({
      ...state,
      isFetching: false,
      error: error,
    }),
})
