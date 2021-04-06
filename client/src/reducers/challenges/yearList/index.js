import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
    CHALLENGES_YEAR_LIST_FETCH_START,
    CHALLENGES_YEAR_LIST_FETCH_SUCCESS,
    CHALLENGES_YEAR_LIST_FETCH_FAILURE,
} from '../../../actions/challenges/types'


export default createReducer(initialState, {
    [CHALLENGES_YEAR_LIST_FETCH_START]: state => ({
      ...state,
      yearList: [],
      isFetching: true,
    }),
  
    [CHALLENGES_YEAR_LIST_FETCH_SUCCESS]: (state, yearList) => ({
      ...state,
      yearList: yearList,
      isFetching: false,
    }),
  
    [CHALLENGES_YEAR_LIST_FETCH_FAILURE]: (state) => ({
      ...state,
      yearList: [],
      isFetching: false,
    }),
})
