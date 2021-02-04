import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchExecutions from './index'
import reducer from '../../../../reducers'
import {
  HOME_EXECUTIONS_FETCH_START,
  HOME_EXECUTIONS_FETCH_SUCCESS,
  HOME_EXECUTIONS_FETCH_FAILURE,
} from '../types'
import { HOME_ENTRIES_TYPES } from '../../../../constants'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeJobShape'


describe('fetchExecutions()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const executions = []
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/jobs?page=1'
    MAP.mapToHomeApp = jest.fn((app) => (app))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { executions, pagination })

      return store.dispatch(fetchExecutions()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTIONS_FETCH_START, payload: HOME_ENTRIES_TYPES.PRIVATE },
          { type: HOME_EXECUTIONS_FETCH_SUCCESS, payload: { executionsType: HOME_ENTRIES_TYPES.PRIVATE, executions, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchExecutions()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTIONS_FETCH_START, payload: HOME_ENTRIES_TYPES.PRIVATE },
          { type: HOME_EXECUTIONS_FETCH_FAILURE, payload: HOME_ENTRIES_TYPES.PRIVATE },
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
