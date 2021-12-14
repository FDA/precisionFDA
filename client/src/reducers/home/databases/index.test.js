import reducer from './index'
import {
  HOME_DATABASES_FETCH_START,
  HOME_DATABASES_FETCH_DETAILS_START,
  HOME_DATABASES_FETCH_DETAILS_SUCCESS,
  HOME_DATABASES_FETCH_DETAILS_FAILURE,
  HOME_DATABASES_RESET_FILTERS,
} from '../../../actions/home/databases/types'
import { HOME_DATABASE_TYPES } from '../../../constants'


describe('fetch private databases start', () => {
  it('HOME_DATABASES_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_DATABASES_FETCH_START, payload: HOME_DATABASE_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_DATABASE_TYPES.PRIVATE]: {
        isFetching: true,
      },
    })
  })
})

describe('fetch database details', () => {
  it('HOME_DATABASES_FETCH_DETAILS_START', () => {
    const initialState = {}
    const action = { type: HOME_DATABASES_FETCH_DETAILS_START, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      databaseDetails: {
        isFetching: true,
        database: {},
        meta: {},
      },
    })
  })

  it('HOME_DATABASES_FETCH_DETAILS_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_DATABASES_FETCH_DETAILS_SUCCESS, payload: { database: 'database', meta: 'meta' }}

    expect(reducer(initialState, action)).toEqual({
      databaseDetails: {
        isFetching: false,
        database: 'database',
        meta: 'meta',
      },
    })
  })

  it('HOME_DATABASES_FETCH_DETAILS_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_DATABASES_FETCH_DETAILS_FAILURE, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      databaseDetails: {
        isFetching: false,
      },
    })
  })
})

describe('reset filter value', () => {
  it('HOME_DATABASES_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: HOME_DATABASES_RESET_FILTERS, payload: { databasesType: HOME_DATABASE_TYPES.PRIVATE }}

    expect(reducer(initialState, action)).toEqual({
      [HOME_DATABASE_TYPES.PRIVATE]: {
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
