import reducer from './index'
import {
  CHALLENGES_YEAR_LIST_FETCH_FAILURE,
  CHALLENGES_YEAR_LIST_FETCH_START,
  CHALLENGES_YEAR_LIST_FETCH_SUCCESS,
} from '../../../actions/challenges/types'


describe('reducer actions processing', () => {
  it('CHALLENGES_YEAR_LIST_FETCH_START', () => {
    const initialState = {
      yearList: [],
      isFetching: true,    
    }
    const action = { type: CHALLENGES_YEAR_LIST_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
      yearList: [],
    })
  })

  it('CHALLENGES_YEAR_LIST_FETCH_SUCCESS', () => {
    const initialState = {
      yearList: [],
      isFetching: true,    
    }
    const payload = ['2010']
    const action = { type: CHALLENGES_YEAR_LIST_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      yearList: payload,
    })
  })

  it('CHALLENGES_YEAR_LIST_FETCH_FAILURE', () => {
    const initialState = {
      yearList: [],
      isFetching: true,    
    }
    const action = { type: CHALLENGES_YEAR_LIST_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      yearList: [],
    })
  })
})
