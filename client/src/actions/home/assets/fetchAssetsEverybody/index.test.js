import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAssetsEverybody from './index'
import reducer from '../../../../reducers'
import {
  HOME_ASSETS_FETCH_START,
  HOME_ASSETS_FETCH_SUCCESS,
  HOME_ASSETS_FETCH_FAILURE,
} from '../types'
import { HOME_ENTRIES_TYPES } from '../../../../constants'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeAssetShape'


describe('fetchAssetsEverybody()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const assets = ['asset1', 'asset2']
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/assets/everybody?page=1'
    MAP.mapToHomeAsset = jest.fn((e) => (e))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { assets, pagination })

      return store.dispatch(fetchAssetsEverybody()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSETS_FETCH_START, payload: HOME_ENTRIES_TYPES.EVERYBODY },
          { type: HOME_ASSETS_FETCH_SUCCESS, payload: { assetsType: HOME_ENTRIES_TYPES.EVERYBODY, assets, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchAssetsEverybody()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSETS_FETCH_START, payload: HOME_ENTRIES_TYPES.EVERYBODY },
          { type: HOME_ASSETS_FETCH_FAILURE, payload: HOME_ENTRIES_TYPES.EVERYBODY },
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
