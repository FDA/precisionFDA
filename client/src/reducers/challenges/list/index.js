import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  CHALLENGES_FETCH_START,
  CHALLENGES_FETCH_SUCCESS,
  CHALLENGES_FETCH_FAILURE,
  CHALLENGES_SET_PAGE,
  CHALLENGES_SET_YEAR,
  CHALLENGES_LIST_RESET_FILTERS,
  CHALLENGES_SET_TIME_STATUS,
} from '../../../actions/challenges/types'


export default createReducer(initialState, {
  [CHALLENGES_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [CHALLENGES_FETCH_SUCCESS]: (state, payload) => ({
    ...state,
    items: [...payload.challenges],
    pagination: {
      ...state.pagination,
      ...payload.pagination,
    },
    isFetching: false,
  }),

  [CHALLENGES_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [CHALLENGES_SET_PAGE]: (state, page) => ({
    ...state,
    pagination: {
      ...state.pagination,
      currentPage: page,
    },
  }),

  [CHALLENGES_SET_YEAR]: (state, year) => ({
    ...state,
    year: year,
  }),

  [CHALLENGES_SET_TIME_STATUS]: (state, timeStatus) => ({
    ...state,
    timeStatus: timeStatus,
  }),

  [CHALLENGES_LIST_RESET_FILTERS]: (state) => ({
    ...state,
    year: null,
    timeStatus: null,
    pagination: null,
  }),
})
