import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAppsFeatured from './index'
import reducer from '../../../../reducers'
import {
<<<<<<< HEAD
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
} from '../../types'
import { HOME_APP_TYPES } from '../../../../constants'
=======
  HOME_APPS_FEATURED_FETCH_START,
  HOME_APPS_FEATURED_FETCH_SUCCESS,
  HOME_APPS_FEATURED_FETCH_FAILURE,
} from '../../types'
>>>>>>> production
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeAppShape'


describe('fetchAppsFeatured()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const apps = ['app1', 'app2']
<<<<<<< HEAD
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/apps/featured?page=1'
=======

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/apps/featured'
>>>>>>> production
    MAP.mapToHomeApp = jest.fn((app) => (app))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
<<<<<<< HEAD
      fetchMock.get(url, { apps, pagination })
=======
      fetchMock.get(url, { apps })
>>>>>>> production

      return store.dispatch(fetchAppsFeatured()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
<<<<<<< HEAD
          { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.FEATURED },
          { type: HOME_APPS_FETCH_SUCCESS, payload: { appsType: HOME_APP_TYPES.FEATURED, apps, pagination }},
=======
          { type: HOME_APPS_FEATURED_FETCH_START, payload: {}},
          { type: HOME_APPS_FEATURED_FETCH_SUCCESS, payload: apps },
>>>>>>> production
        ]) 
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchAppsFeatured()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
<<<<<<< HEAD
          { type: HOME_APPS_FETCH_START, payload: HOME_APP_TYPES.FEATURED },
          { type: HOME_APPS_FETCH_FAILURE, payload: HOME_APP_TYPES.FEATURED },
=======
          { type: HOME_APPS_FEATURED_FETCH_START, payload: {}},
          { type: HOME_APPS_FEATURED_FETCH_FAILURE, payload: {}},
>>>>>>> production
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
<<<<<<< HEAD
})
=======
})
>>>>>>> production
