import reducer from './index'
import {
  EXPERTS_LIST_FETCH_FAILURE,
  EXPERTS_LIST_FETCH_START,
  EXPERTS_LIST_FETCH_SUCCESS,
} from '../../../actions/experts/types'


describe('reducer actions processing', () => {
  it('EXPERTS_LIST_FETCH_START', () => {
    const initialState = {}
    const action = { type: EXPERTS_LIST_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('EXPERTS_LIST_FETCH_SUCCESS', () => {
    const initialState = { pagination: {} }
    const payload = { items: [{'id': 1, title: 'Expert 1'}], pagination: { currentPage: 2}}
    const action = { type: EXPERTS_LIST_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      items: payload.items,
      pagination: payload.pagination,
    })
  })

  it('EXPERTS_LIST_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: EXPERTS_LIST_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })
})
