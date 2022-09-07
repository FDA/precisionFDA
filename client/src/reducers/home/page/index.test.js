import reducer from './index'
import {
  HOME_SET_CURRENT_TAB,
  HOME_SET_CURRENT_PAGE,
  HOME_SET_PAGE_COUNTERS,
  HOME_FETCH_ATTACHING_ITEMS_SUCCESS,
  HOME_FETCH_ATTACHING_ITEMS_START,
  HOME_FETCH_ATTACHING_ITEMS_FAILURE,
  HOME_SET_IS_LEFT_MENU_OPEN,
} from '../../../actions/home/types'


describe('set current home tab', () => {
  it('HOME_SET_CURRENT_TAB', () => {
    const initialState = {}
    const action = { type: HOME_SET_CURRENT_TAB, payload: 'tab' }

    expect(reducer(initialState, action)).toEqual({
      currentTab: 'tab',
    })
  })
})

describe('set current home page', () => {
  it('HOME_SET_CURRENT_PAGE', () => {
    const initialState = {}
    const action = { type: HOME_SET_CURRENT_PAGE, payload: 'page' }

    expect(reducer(initialState, action)).toEqual({
      currentPage: 'page',
    })
  })
})

describe('set page counters', () => {
  it('HOME_SET_PAGE_COUNTERS', () => {
    const initialState = {
      counters: {
        tab: {},
      },
    }
    const action = { type: HOME_SET_PAGE_COUNTERS, payload: { counters: {}, tab: 'tab' }}

    expect(reducer(initialState, action)).toEqual({
      counters: {
        tab: {},
      },
    })
  })
})

describe('fetch attaching items', () => {
  it('HOME_FETCH_ATTACHING_ITEMS_START', () => {
    const initialState = {}
    const action = { type: HOME_FETCH_ATTACHING_ITEMS_START, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      attachingItems: {
        isLoading: true,
      },
    })
  })

  it('HOME_FETCH_ATTACHING_ITEMS_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_FETCH_ATTACHING_ITEMS_SUCCESS, payload: []}

    expect(reducer(initialState, action)).toEqual({
      attachingItems: {
        isLoading: false,
        items: [],
      },
    })
  })

  it('HOME_FETCH_ATTACHING_ITEMS_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_FETCH_ATTACHING_ITEMS_FAILURE, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      attachingItems: {
        isLoading: false,
      },
    })
  })
})

describe('set is menu open', () => {
  it('HOME_SET_IS_LEFT_MENU_OPEN', () => {
    const initialState = { isLeftMenuOpen: false }
    const action = { type: HOME_SET_IS_LEFT_MENU_OPEN, payload: true }

    expect(reducer(initialState, action)).toEqual({
      isLeftMenuOpen: true,
    })
  })
})
