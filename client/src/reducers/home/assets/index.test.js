import reducer from './index'
import {
  HOME_ASSETS_FETCH_START,
  HOME_ASSETS_FETCH_SUCCESS,
  HOME_ASSETS_FETCH_FAILURE,
  HOME_ASSETS_FETCH_ASSET_DETAILS_START,
  HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS,
  HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE,
} from '../../../actions/home/assets/types'
import { HOME_ENTRIES_TYPES } from '../../../constants'


describe('fetch private assets', () => {
  it('HOME_ASSETS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_ASSETS_FETCH_START, payload: HOME_ENTRIES_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        isFetching: true,
      },
    })
  })

  it('HOME_ASSETS_FETCH_SUCCESS', () => {
    const initialState = {
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        filters: {},
      },
    }
    const assets = [1, 2, 3]
    const action = { type: HOME_ASSETS_FETCH_SUCCESS, payload: { assetsType: HOME_ENTRIES_TYPES.PRIVATE, assets }}

    expect(reducer(initialState, action)).toEqual({
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        isFetching: false,
        isCheckedAll: false,
        filters: {},
        assets,
      },
    })
  })

  it('HOME_ASSETS_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_ASSETS_FETCH_FAILURE, payload: HOME_ENTRIES_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        isFetching: false,
      },
    })
  })
})

describe('fetch asset details', () => {
  it('HOME_ASSETS_FETCH_ASSET_DETAILS_START', () => {
    const initialState = {}
    const action = { type: HOME_ASSETS_FETCH_ASSET_DETAILS_START }

    expect(reducer(initialState, action)).toEqual({
      assetDetails: {
        isFetching: true,
      },
    })
  })

  it('HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS', () => {
    const initialState = {}
    const asset = { a: 1 }
    const meta = { b: 1 }
    const action = { type: HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS, payload: { asset, meta }}

    expect(reducer(initialState, action)).toEqual({
      assetDetails: {
        isFetching: false,
        asset,
        meta,
      },
    })
  })

  it('HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      assetDetails: {
        isFetching: false,
      },
    })
  })
})
