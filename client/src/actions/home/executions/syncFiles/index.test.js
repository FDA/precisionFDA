import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import syncFiles from '.'
import reducer from '../../../../reducers'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL, HOME_EXECUTIONS_MODALS } from '../../../../constants'


describe('syncFiles()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = '/api/jobs/sync_files'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const message = { type: 'success', text: 'message text' }
      fetchMock.patch(link, { message })

      return store.dispatch(syncFiles(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTION_MODAL_ACTION_START, payload: HOME_EXECUTIONS_MODALS.SYNC_FILES },
          { type: HOME_EXECUTION_MODAL_ACTION_SUCCESS, payload: HOME_EXECUTIONS_MODALS.SYNC_FILES },
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
      const error = { message: 'An error has occurred' }
      fetchMock.patch(link, { status: 500, body: { error }})

      return store.dispatch(syncFiles(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EXECUTION_MODAL_ACTION_START, payload: HOME_EXECUTIONS_MODALS.SYNC_FILES },
          { type: HOME_EXECUTION_MODAL_ACTION_FAILURE, payload: HOME_EXECUTIONS_MODALS.SYNC_FILES },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'An error has occurred',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
