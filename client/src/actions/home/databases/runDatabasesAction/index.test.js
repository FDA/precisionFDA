import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import runDatabasesAction from '.'
import reducer from '../../../../reducers'
import {
  HOME_DATABASES_RUN_ACTION_START,
  HOME_DATABASES_RUN_ACTION_SUCCESS,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('runDatabasesAction()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = '/api/dbclusters/'
    const api_method = 'start'
    const dxids = [1]

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, {})

      return store.dispatch(runDatabasesAction(link, api_method, dxids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASES_RUN_ACTION_START, payload: {}},
          { type: HOME_DATABASES_RUN_ACTION_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'The Database status was successfully changed.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.put(link, { status: 500, body: {}})

      return store.dispatch(runDatabasesAction(link, api_method, dxids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASES_RUN_ACTION_START, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
