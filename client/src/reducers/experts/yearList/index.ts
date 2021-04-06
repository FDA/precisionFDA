import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
    EXPERTS_YEAR_LIST_FETCH_START,
    EXPERTS_YEAR_LIST_FETCH_SUCCESS,
    EXPERTS_YEAR_LIST_FETCH_FAILURE
} from '../../../actions/experts/types'
import { IYearListActionPayload } from '../../../actions/interfaces'

export default createReducer(initialState, {
    [EXPERTS_YEAR_LIST_FETCH_START]: (state: any) => ({
      ...state,
      yearList: [],
      isFetching: true,
    }),
  
    [EXPERTS_YEAR_LIST_FETCH_SUCCESS]: (state: any, payload: IYearListActionPayload) => ({
      ...state,
      yearList: payload.yearList,
      isFetching: false,
    }),
  
    [EXPERTS_YEAR_LIST_FETCH_FAILURE]: (state: any) => ({
      ...state,
      yearList: [],
      isFetching: false,
    }),
})
