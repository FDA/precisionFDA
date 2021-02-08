import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import terminateExecutions from '.'
import reducer from '../../../../reducers'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL, HOME_EXECUTIONS_MODALS } from '../../../../constants'


describe('terminateExecutions()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const ids = [1]
    const link = '/api/jobs/terminate'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const message = { type: 'success', text: 'message text' }

      fetchMock.post(link, { message })

      return store.dispatch(terminateExecutions(link, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTION_MODAL_ACTION_START, payload: HOME_EXECUTIONS_MODALS.TERMINATE },
          { type: HOME_EXECUTION_MODAL_ACTION_SUCCESS, payload: HOME_EXECUTIONS_MODALS.TERMINATE },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message text',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(terminateExecutions(link, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTION_MODAL_ACTION_START, payload: HOME_EXECUTIONS_MODALS.TERMINATE },
          { type: HOME_EXECUTION_MODAL_ACTION_FAILURE, payload: HOME_EXECUTIONS_MODALS.TERMINATE },
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
