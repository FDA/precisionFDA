import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import makePublic from '.'
import reducer from '../../../reducers'
import {
  HOME_MAKE_PUBLIC_FOLDER_START,
  HOME_MAKE_PUBLIC_FOLDER_SUCCESS,
  HOME_MAKE_PUBLIC_FOLDER_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('makePublic()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const objectType = OBJECT_TYPES.FILE
    const ids = [1, 2, 3]
    const link = '/api/folders/publish_folders'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'success', message: 'Objects are successfully published.' },
      ]
      fetchMock.post(link, messages)

      return store.dispatch(makePublic(link, objectType, ids)).then(() => {
        const actions = store.getActions()
        expect(actions).toEqual([
          { type: HOME_MAKE_PUBLIC_FOLDER_START, payload: {}},
          { type: HOME_MAKE_PUBLIC_FOLDER_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Objects are successfully published.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on warning response', () => {
      const messages = [
        { messages: [{ type: 'warning', text: 'message 1' }]},
      ]
      fetchMock.post(link, messages[0])

      return store.dispatch(makePublic(link, objectType, ids)).then(() => {
        const actions = store.getActions()
        expect(actions).toEqual([
          { type: HOME_MAKE_PUBLIC_FOLDER_START, payload: {}},
          { type: HOME_MAKE_PUBLIC_FOLDER_SUCCESS, payload: {}},
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

      return store.dispatch(makePublic(link, objectType, ids)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_MAKE_PUBLIC_FOLDER_START, payload: {}},
          { type: HOME_MAKE_PUBLIC_FOLDER_FAILURE, payload: {}},
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
