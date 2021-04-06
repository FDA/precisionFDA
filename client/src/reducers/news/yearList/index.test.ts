import reducer from './index'
import {
  NEWS_YEAR_LIST_FETCH_FAILURE,
  NEWS_YEAR_LIST_FETCH_START,
  NEWS_YEAR_LIST_FETCH_SUCCESS,
} from '../../../actions/news/types'


describe('reducer actions processing', () => {
  it('NEWS_YEAR_LIST_FETCH_START', () => {
    const initialState = {}
    const action = { type: NEWS_YEAR_LIST_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
      yearList: [],
    })
  })

  it('NEWS_YEAR_LIST_FETCH_SUCCESS', () => {
    const initialState = {
      yearList: [],
      isFetching: true,    
    }
    const payload = { yearList: [2010, 2009, 2008] }
    const action = { type: NEWS_YEAR_LIST_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      yearList: payload.yearList,
    })
  })

  it('NEWS_YEAR_LIST_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: NEWS_YEAR_LIST_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      yearList: [],
    })
  })
})
