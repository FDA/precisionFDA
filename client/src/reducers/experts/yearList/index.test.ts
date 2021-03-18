import reducer from './index'
import {
  EXPERTS_YEAR_LIST_FETCH_FAILURE,
  EXPERTS_YEAR_LIST_FETCH_START,
  EXPERTS_YEAR_LIST_FETCH_SUCCESS,
} from '../../../actions/experts/types'


describe('reducer actions processing', () => {
  it('EXPERTS_YEAR_LIST_FETCH_START', () => {
    const initialState = {
      isFetching: true,
      yearList: [],
    }
    const action = { type: EXPERTS_YEAR_LIST_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
      yearList: [],
    })
  })

  it('EXPERTS_YEAR_LIST_FETCH_SUCCESS', () => {
    const initialState = {
      yearList: [],
      isFetching: true,
    }
    const payload = { yearList: ['2010'] }
    const action = { type: EXPERTS_YEAR_LIST_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      yearList: payload.yearList,
    })
  })

  it('EXPERTS_YEAR_LIST_FETCH_FAILURE', () => {
    const initialState = {
      yearList: [],
      isFetching: true,
    }
    const action = { type: EXPERTS_YEAR_LIST_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      yearList: [],
      isFetching: false,
    })
  })
})
