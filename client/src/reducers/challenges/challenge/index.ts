import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  CHALLENGE_FETCH_START,
  CHALLENGE_FETCH_SUCCESS,
  CHALLENGE_FETCH_FAILURE,
} from '../../../actions/challenges/types'
import {
  SUBMISSIONS_FETCH_START,
  SUBMISSIONS_FETCH_SUCCESS,
  SUBMISSIONS_FETCH_FAILURE,
  MY_ENTRIES_FETCH_START,
  MY_ENTRIES_FETCH_SUCCESS,
  MY_ENTRIES_FETCH_FAILURE,
} from '../../../actions/submissions/types'
import { ISubmission } from '../../../types/submission'


export default createReducer(initialState, {
  [CHALLENGE_FETCH_START]: (state: any) => ({
    ...state,
    isFetching: true,
  }),

  [CHALLENGE_FETCH_SUCCESS]: (state: any, challenge: any) => ({
    ...state,
    data: { ...challenge },
    isFetching: false,
  }),

  [CHALLENGE_FETCH_FAILURE]: (state: any, error: string) => ({
    ...state,
    isFetching: false,
    error: error,
  }),

  [SUBMISSIONS_FETCH_START]: (state: any) => ({
    ...state,
    submissions: {
      ...state.submissions,
      isFetching: true,
    },
  }),

  [SUBMISSIONS_FETCH_SUCCESS]: (state: any, submissions: ISubmission[]) => ({
    ...state,
    submissions: {
      ...state.submissions,
      data: submissions,
      isFetching: false,
    },
  }),

  [SUBMISSIONS_FETCH_FAILURE]: (state: any, error: string) => ({
    ...state,
    submissions: {
      ...state.submissions,
      isFetching: false,
      error: error,
    },
  }),

  [MY_ENTRIES_FETCH_START]: (state: any) => ({
    ...state,
    myEntries: {
      ...state.myEntries,
      isFetching: true,
    },
  }),

  [MY_ENTRIES_FETCH_SUCCESS]: (state: any, submissions: ISubmission[]) => ({
    ...state,
    myEntries: {
      ...state.myEntries,
      data: submissions,
      isFetching: false,
    },
  }),

  [MY_ENTRIES_FETCH_FAILURE]: (state: any, error: string) => ({
    ...state,
    myEntries: {
      ...state.myEntries,
      isFetching: false,
      error: error,
    },
  }),
})
