import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAppExecutions from './index'
import reducer from '../../../../reducers'
import {
  HOME_APPS_FETCH_APP_EXECUTIONS_START,
  HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS,
  HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeJobShape'


describe('fetchAppExecutions()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const jobs = ['asd']
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = 'api/apps/1/jobs?page=1'
    const uid = 1

    MAP.mapToJob = jest.fn((job) => (job))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { jobs, pagination })

      return store.dispatch(fetchAppExecutions(uid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_FETCH_APP_EXECUTIONS_START, payload: {}},
          { type: HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS, payload: { jobs, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchAppExecutions(uid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_FETCH_APP_EXECUTIONS_START, payload: {}},
          { type: HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
