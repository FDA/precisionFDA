import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import comparisonAction from '.'
import reducer from '../../../../reducers'
import {
  HOME_APPS_COMPARISON_ACTION_START,
  HOME_APPS_COMPARISON_ACTION_SUCCESS,
  HOME_APPS_COMPARISON_ACTION_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('comparisonAction()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const dxid = 1
    const link = '/admin/apps/set_comparison_app'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(link, { meta: { messages }})

      return store.dispatch(comparisonAction(link, dxid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_COMPARISON_ACTION_START, payload: {}},
          { type: HOME_APPS_COMPARISON_ACTION_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 1',
              style: 'warning',
              type: ALERT_ABOVE_ALL,
            },
          },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 2',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(comparisonAction(link, dxid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_APPS_COMPARISON_ACTION_START, payload: {}},
          { type: HOME_APPS_COMPARISON_ACTION_FAILURE, payload: {}},
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
