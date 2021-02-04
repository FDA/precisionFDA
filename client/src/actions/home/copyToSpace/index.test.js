import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import copyToSpace from '.'
import reducer from '../../../reducers'
import {
  HOME_COPY_APP_TO_SPACE_START,
  HOME_COPY_APP_TO_SPACE_SUCCESS,
  HOME_COPY_APP_TO_SPACE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('copyToSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const scope = 'space-1'
    const ids = [1, 2, 3]
    const copyLink = '/api/apps/copy'
    const objectType = OBJECT_TYPES.APP

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(copyLink, { meta: { messages }})

      return store.dispatch(copyToSpace(copyLink, objectType, scope, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_COPY_APP_TO_SPACE_START, payload: {}},
          { type: HOME_COPY_APP_TO_SPACE_SUCCESS, payload: {}},
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

      return store.dispatch(copyToSpace(copyLink, objectType, scope, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_COPY_APP_TO_SPACE_START, payload: {}},
          { type: HOME_COPY_APP_TO_SPACE_FAILURE, payload: {}},
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
