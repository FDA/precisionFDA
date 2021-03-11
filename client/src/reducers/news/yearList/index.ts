import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
    NEWS_YEAR_LIST_FETCH_START,
    NEWS_YEAR_LIST_FETCH_SUCCESS,
    NEWS_YEAR_LIST_FETCH_FAILURE
} from '../../../actions/news/types'
import { IYearListActionPayload } from '../../../actions/interfaces'


export default createReducer(initialState, {
    [NEWS_YEAR_LIST_FETCH_START]: (state: any) => ({
      ...state,
      yearList: [],
      isFetching: true,
    }),
  
    [NEWS_YEAR_LIST_FETCH_SUCCESS]: (state: any, payload: IYearListActionPayload) => ({
      ...state,
      yearList: payload.yearList,
      isFetching: false,
    }),
  
    [NEWS_YEAR_LIST_FETCH_FAILURE]: (state: any) => ({
      ...state,
      yearList: [],
      isFetching: false,
    }),
})
