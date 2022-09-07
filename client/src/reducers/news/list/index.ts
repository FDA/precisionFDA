import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  NEWS_LIST_FETCH_START,
  NEWS_LIST_FETCH_SUCCESS,
  NEWS_LIST_FETCH_FAILURE,
  NEWS_LIST_SET_PAGE,
  NEWS_LIST_SET_YEAR,
  NEWS_LIST_RESET_FILTERS,
} from '../../../actions/news/types'
import { IPagination } from '../../../types/pagination'
import { INewsItem } from '../../../types/newsItem'


interface INewsListActionPayload {
  items: INewsItem[],
  pagination: IPagination,
}


export default createReducer(initialState, {
  [NEWS_LIST_FETCH_START]: (state: any) => ({
    ...state,
    isFetching: true,
  }),

  [NEWS_LIST_FETCH_SUCCESS]: (state: any, payload: INewsListActionPayload) => ({
    ...state,
    items: [...payload.items],
    pagination: {
      ...state.pagination,
      ...payload.pagination,
    },
    isFetching: false,
  }),

  [NEWS_LIST_FETCH_FAILURE]: (state: any) => ({
    ...state,
    isFetching: false,
  }),

  [NEWS_LIST_SET_PAGE]: (state: any, page: number) => ({
    ...state,
    pagination: {
      ...state.pagination,
      currentPage: page,
    },
  }),

  [NEWS_LIST_SET_YEAR]: (state: any, year: number) => ({
    ...state,
    year: year
  }),

  [NEWS_LIST_RESET_FILTERS]: (state: any) => ({
    ...state,
    year: null,
    pagination: null,
  })
})

export type {
  INewsListActionPayload,
}
