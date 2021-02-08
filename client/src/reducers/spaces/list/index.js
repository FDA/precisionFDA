import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACES_FETCH_START,
  SPACES_FETCH_SUCCESS,
  SPACES_FETCH_FAILURE,
  SPACES_SWITCH_LIST_VIEW_TYPE,
  SPACES_SORT_SPACES_TABLE,
  SPACES_LIST_SEARCH,
  SPACES_LIST_RESET_FILTERS,
  SPACE_LOCK_TOGGLE_START,
  SPACE_LOCK_TOGGLE_SUCCESS,
  SPACE_LOCK_TOGGLE_FAILURE,
  SPACES_SET_PAGE,
} from '../../../actions/spaces/types'


export default createReducer(initialState, {
  [SPACES_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACES_FETCH_SUCCESS]: (state, payload) => ({
    ...state,
    entries: [...payload.spaces],
    pagination: {
      ...state.pagination,
      ...payload.pagination,
    },
    isFetching: false,
  }),

  [SPACES_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACES_SWITCH_LIST_VIEW_TYPE]: (state, viewType) => ({
    ...state,
    viewType: viewType,
  }),

  [SPACES_SORT_SPACES_TABLE]: (state, { type, direction }) => ({
    ...state,
    sortType: type,
    sortDirection: direction,
  }),

  [SPACES_LIST_RESET_FILTERS]: (state) => ({
    ...state,
    sortType: null,
    sortDirection: null,
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  }),

  [SPACES_LIST_SEARCH]: (state, searchString) => ({
    ...state,
    searchString,
  }),

  [SPACE_LOCK_TOGGLE_START]: (state, spaces) => ({
    ...state,
    entries: [...spaces],
  }),

  [SPACE_LOCK_TOGGLE_SUCCESS]: (state, spaces) => ({
    ...state,
    entries: [...spaces],
  }),

  [SPACE_LOCK_TOGGLE_FAILURE]: (state, payload) => ({
    ...state,
    entries: [...payload.spaces],
  }),

  [SPACES_SET_PAGE]: (state, page) => ({
    ...state,
    pagination: {
      ...state.pagination,
      currentPage: page,
    },
  }),
})
