import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_JOBS_FETCH_START,
  SPACE_JOBS_FETCH_SUCCESS,
  SPACE_JOBS_FETCH_FAILURE,
  SPACE_JOBS_TABLE_SORT,
  SPACE_JOBS_RESET_FILTERS,
} from '../../../actions/spaces/types'


export default createReducer(initialState, {
  [SPACE_JOBS_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_JOBS_FETCH_SUCCESS]: (state, { jobs }) => ({
    ...state,
    entries: [...jobs],
    isFetching: false,
  }),

  [SPACE_JOBS_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_JOBS_TABLE_SORT]: (state, { type, direction }) => ({
    ...state,
    sortType: type,
    sortDirection: direction,
  }),

  [SPACE_JOBS_RESET_FILTERS]: (state) => ({
    ...state,
    sortType: null,
    sortDirection: null,
  }),
})
