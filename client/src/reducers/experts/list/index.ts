import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  EXPERTS_LIST_FETCH_START,
  EXPERTS_LIST_FETCH_SUCCESS,
  EXPERTS_LIST_FETCH_FAILURE,
  EXPERTS_LIST_SET_PAGE,
  EXPERTS_LIST_SET_YEAR,
  EXPERTS_LIST_RESET_FILTERS,
} from '../../../actions/experts/types'
import { IExpertsListActionPayload } from './IExpertsListActionPayload'


export default createReducer(initialState, {
  [EXPERTS_LIST_FETCH_START]: (state: any) => ({
    ...state,
    isFetching: true,
  }),

  [EXPERTS_LIST_FETCH_SUCCESS]: (state: any, payload: IExpertsListActionPayload) => ({
    ...state,
    items: [...payload.items],
    pagination: {
      ...state.pagination,
      ...payload.pagination,
    },
    isFetching: false,
  }),

  [EXPERTS_LIST_FETCH_FAILURE]: (state: any) => ({
    ...state,
    isFetching: false,
  }),

  [EXPERTS_LIST_SET_PAGE]: (state: any, page: number) => ({
    ...state,
    pagination: {
      ...state.pagination,
      currentPage: page,
    },
  }),

  [EXPERTS_LIST_SET_YEAR]: (state: any, year: number) => ({
    ...state,
    year: year,
    pagination: null,
  }),

  [EXPERTS_LIST_RESET_FILTERS]: (state: any) => ({
    ...state,
    year: null,
    pagination: null,
  })
})
