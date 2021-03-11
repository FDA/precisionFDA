import reducer from './index'
import {
  NEWS_LIST_FETCH_FAILURE,
  NEWS_LIST_FETCH_START,
  NEWS_LIST_FETCH_SUCCESS,
} from '../../../actions/news/types'


describe('reducer actions processing', () => {
  it('NEWS_LIST_FETCH_START', () => {
    const initialState = {}
    const action = { type: NEWS_LIST_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('NEWS_LIST_FETCH_SUCCESS', () => {
    const initialState = { pagination: {} }
    const payload = { items: [{'id': 1, name: 'news item 1'}], pagination: { currentPage: 2}}
    const action = { type: NEWS_LIST_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      items: payload.items,
      pagination: payload.pagination,
    })
  })

  it('NEWS_LIST_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: NEWS_LIST_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })
})
