import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchApps from './index'
import reducer from '../../../../reducers'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
} from '../../types'
import { HOME_APP_TYPES } from '../../../../constants'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeAppShape'


describe('fetchApps()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const apps = ['app1', 'app2']
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/apps?page=1'
    MAP.mapToHomeApp = jest.fn((app) => (app))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { apps, pagination })

      return store.dispatch(fetchApps()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.PRIVATE },
          { type: HOME_APPS_FETCH_SUCCESS, payload: { appsType: HOME_APP_TYPES.PRIVATE, apps, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchApps()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.PRIVATE },
          { type: HOME_APPS_FETCH_FAILURE, payload: HOME_APP_TYPES.PRIVATE },
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
