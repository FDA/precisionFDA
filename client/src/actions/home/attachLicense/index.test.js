import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import attachLicense from '.'
import reducer from '../../../reducers'
import {
  HOME_ATTACH_LICENSE_START,
  HOME_ATTACH_LICENSE_SUCCESS,
  HOME_ATTACH_LICENSE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('attachLicense()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const ids = [1, 2, 3]
    const link = '/api/license_items/1/1'
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

      return store.dispatch(attachLicense(ids, objectType, link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ATTACH_LICENSE_START, payload: {}},
          { type: HOME_ATTACH_LICENSE_SUCCESS, payload: {}},
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

      return store.dispatch(attachLicense(ids, objectType, link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ATTACH_LICENSE_START, payload: {}},
          { type: HOME_ATTACH_LICENSE_FAILURE, payload: {}},
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
