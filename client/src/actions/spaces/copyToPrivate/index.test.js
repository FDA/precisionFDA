import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import copyToPrivate from '.'
import reducer from '../../../reducers'
import {
  COPY_OBJECTS_TO_PRIVATE_START,
  COPY_OBJECTS_TO_PRIVATE_SUCCESS,
  COPY_OBJECTS_TO_PRIVATE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('copyToPrivate()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const ids = [1, 2, 3]
    const copyLink = '/api/ids/copy'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]
      fetchMock.post(copyLink, { meta: { messages }})

      return store.dispatch(copyToPrivate(copyLink, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: COPY_OBJECTS_TO_PRIVATE_START, payload: {}},
          { type: COPY_OBJECTS_TO_PRIVATE_SUCCESS, payload: {}},
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

      return store.dispatch(copyToPrivate(copyLink, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: COPY_OBJECTS_TO_PRIVATE_START, payload: {}},
          { type: COPY_OBJECTS_TO_PRIVATE_FAILURE, payload: {}},
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
