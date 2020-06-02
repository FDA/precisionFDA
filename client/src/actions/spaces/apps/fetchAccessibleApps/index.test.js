import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAccessibleApps from '.'
import reducer from '../../../../reducers'
import {
  FETCH_ACCESSIBLE_APPS_START,
  FETCH_ACCESSIBLE_APPS_SUCCESS,
  FETCH_ACCESSIBLE_APPS_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import * as MAP from '../../../../views/shapes/AccessibleObjectsShape'


describe('fetchAccessibleApps()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const url = '/api/spaces/editable_spaces'
    const apps = ['app1', 'app2']
    const store = mockStore(reducer({
      context: {
        links: {
          accessible_apps: url,
        },
      },
    }, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('fetchAccessibleApps dispatches correct actions on success response', () => {
      fetchMock.post(url, apps)
      MAP.mapToAccessibleApp = jest.fn((app) => app)

      return store.dispatch(fetchAccessibleApps()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_APPS_START, payload: {}},
          { type: FETCH_ACCESSIBLE_APPS_SUCCESS, payload: apps },
        ])
      })
    })

    it('fetchAccessibleApps dispatches correct actions on failure response', () => {
      fetchMock.post(url, { status: 500, body: {}})

      return store.dispatch(fetchAccessibleApps()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_APPS_START, payload: {}},
          { type: FETCH_ACCESSIBLE_APPS_FAILURE, payload: {}},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
