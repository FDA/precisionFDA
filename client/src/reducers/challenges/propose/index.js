import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
    PROPOSE_CHALLENGE_FETCH_START,
    PROPOSE_CHALLENGE_FETCH_SUCCESS,
    PROPOSE_CHALLENGE_FETCH_FAILURE,
    PROPOSE_CHALLENGE_FORM_RESET,
} from '../../../actions/challenges/types'


export default createReducer(initialState, {
    [PROPOSE_CHALLENGE_FETCH_START]: state => ({
      ...state,
      isSubmitting: true,
      submissionSuccess: false,
    }),
  
    [PROPOSE_CHALLENGE_FETCH_SUCCESS]: (state) => ({
      ...state,
      isSubmitting: false,
      submissionSuccess: true,
    }),
  
    [PROPOSE_CHALLENGE_FETCH_FAILURE]: (state) => ({
      ...state,
      isSubmitting: false,
      submissionSuccess: false,
    }),

    [PROPOSE_CHALLENGE_FORM_RESET]: (state) => ({
      ...state,
      isSubmitting: false,
      submissionSuccess: false,
    }),
})
