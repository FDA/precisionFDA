import reducer from './index'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_APP_DETAILS_START,
  HOME_APPS_FETCH_APP_DETAILS_SUCCESS,
  HOME_APPS_FETCH_APP_DETAILS_FAILURE,
  HOME_APPS_RESET_FILTERS,
} from '../../../actions/home/types'
import { HOME_APP_TYPES } from '../../../constants'


describe('fetch private apps start', () => {
  it('HOME_APPS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_APP_TYPES.PRIVATE]: {
        isFetching: true,
      },
    })
  })
})

describe('fetch featured apps start', () => {
  it('HOME_APPS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.FEATURED }

    expect(reducer(initialState, action)).toEqual({
      [HOME_APP_TYPES.FEATURED]: {
        isFetching: true,
      },
    })
  })
})

describe('fetch app details', () => {
  it('HOME_APPS_FETCH_APP_DETAILS_START', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_APP_DETAILS_START, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      appDetails: {
        isFetching: true,
        app: {},
        meta: {},
      },
    })
  })

  it('HOME_APPS_FETCH_APP_DETAILS_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_APP_DETAILS_SUCCESS, payload: { app: 'app', meta: 'meta' }}

    expect(reducer(initialState, action)).toEqual({
      appDetails: {
        isFetching: false,
        app: 'app',
        meta: 'meta',
      },
    })
  })

  it('HOME_APPS_FETCH_APP_DETAILS_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_APP_DETAILS_FAILURE, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      appDetails: {
        isFetching: false,
      },
    })
  })
})

describe('reset filter value', () => {
  it('HOME_APPS_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: HOME_APPS_RESET_FILTERS, payload: { appsType: HOME_APP_TYPES.PRIVATE }}

    expect(reducer(initialState, action)).toEqual({
      [HOME_APP_TYPES.PRIVATE]: {
        filters: {
          sortType: null,
          sortDirection: null,
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          totalPages: null,
          totalCount: null,
          fields: new Map(),
        },
      },
    })
  })
})
