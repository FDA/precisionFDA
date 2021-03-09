import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import makePublic from '.'
import reducer from '../../../reducers'
import {
  HOME_MAKE_PUBLICK_APP_START,
  HOME_MAKE_PUBLICK_APP_SUCCESS,
  HOME_MAKE_PUBLICK_APP_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('makePublic()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const objectType = OBJECT_TYPES.APP
    const ids = [1, 2, 3]
    const copyLink = '/api/apps/copy'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(copyLink, { meta: { messages }})

      return store.dispatch(makePublic(copyLink, objectType, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_MAKE_PUBLICK_APP_START, payload: {}},
          { type: HOME_MAKE_PUBLICK_APP_SUCCESS, payload: {}},
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
      fetchMock.post(copyLink, { status: 500, body: {}})

      return store.dispatch(makePublic(copyLink, objectType, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_MAKE_PUBLICK_APP_START, payload: {}},
          { type: HOME_MAKE_PUBLICK_APP_FAILURE, payload: {}},
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
