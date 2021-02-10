import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import licenseAction from '.'
import reducer from '../../../reducers'
import {
  HOME_LICENSE_ACTION_START,
  HOME_LICENSE_ACTION_SUCCESS,
  HOME_LICENSE_ACTION_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('licenseAction()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = '/api/licenses/1/remove_item/2'
    const objectType = OBJECT_TYPES.FILE

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const message = {
        type: 'warning',
        text: 'message 1',
      }

      fetchMock.post(link, { message })

      return store.dispatch(licenseAction(link, objectType)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_LICENSE_ACTION_START, payload: 'licenseModal' },
          { type: HOME_LICENSE_ACTION_SUCCESS, payload: 'licenseModal' },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'message 1',
              style: 'warning',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(licenseAction(link, objectType)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_LICENSE_ACTION_START, payload: 'licenseModal' },
          { type: HOME_LICENSE_ACTION_FAILURE, payload: 'licenseModal' },
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
