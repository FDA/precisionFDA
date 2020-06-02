import reducer from './index'
import {
  SPACES_FETCH_FAILURE,
  SPACES_FETCH_START,
  SPACES_FETCH_SUCCESS,
  SPACES_LIST_RESET_FILTERS, SPACES_LIST_SEARCH,
  SPACES_SORT_SPACES_TABLE,
  SPACES_SWITCH_LIST_VIEW_TYPE,
  SPACE_LOCK_TOGGLE_START,
  SPACE_LOCK_TOGGLE_SUCCESS,
  SPACE_LOCK_TOGGLE_FAILURE,
} from '../../../actions/spaces/types'


describe('reducer actions processing', () => {
  it('SPACES_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACES_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACES_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { spaces: ['some spaces'], pagination: {}}
    const action = { type: SPACES_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      entries: payload.spaces,
      pagination: payload.pagination,
    })
  })

  it('SPACES_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACES_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACES_SWITCH_LIST_VIEW_TYPE', () => {
    const initialState = {}
    const payload = 'some type'
    const action = { type: SPACES_SWITCH_LIST_VIEW_TYPE, payload }

    expect(reducer(initialState, action)).toEqual({
      viewType: payload,
    })
  })

  it('SPACES_SORT_SPACES_TABLE', () => {
    const initialState = {
      sortType: 'some type',
      sortDirection: 'some direction',
    }
    const action = {
      type: SPACES_SORT_SPACES_TABLE,
      payload: {
        type: 'some other type',
        direction: 'some other direction',
      },
    }

    expect(reducer(initialState, action)).toEqual({
      sortType: 'some other type',
      sortDirection: 'some other direction',
    })
  })

  it('SPACES_LIST_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: SPACES_LIST_RESET_FILTERS }

    expect(reducer(initialState, action)).toEqual({
      sortType: null,
      sortDirection: null,
      pagination: {
        currentPage: 1,
      },
    })
  })

  it('SPACES_LIST_SEARCH', () => {
    const initialState = {}
    const searchString = 'some string'
    const action = { type: SPACES_LIST_SEARCH, payload: searchString }

    expect(reducer(initialState, action)).toEqual({
      searchString,
    })
  })

  it('SPACE_LOCK_TOGGLE_START', () => {
    const initialState = {}
    const spaces = ['some spaces']
    const action = { type: SPACE_LOCK_TOGGLE_START, payload: spaces }

    expect(reducer(initialState, action)).toEqual({
      entries: spaces,
    })
  })

  it('SPACE_LOCK_TOGGLE_SUCCESS', () => {
    const initialState = {}
    const spaces = ['some spaces']
    const action = { type: SPACE_LOCK_TOGGLE_SUCCESS, payload: spaces }

    expect(reducer(initialState, action)).toEqual({
      entries: spaces,
    })
  })

  it('SPACE_LOCK_TOGGLE_FAILURE', () => {
    const initialState = {}
    const spaces = ['some spaces']
    const action = { type: SPACE_LOCK_TOGGLE_FAILURE, payload: { spaces }}

    expect(reducer(initialState, action)).toEqual({
      entries: spaces,
    })
  })
})
