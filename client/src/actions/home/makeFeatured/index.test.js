import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import makeFeatured from '.'
import reducer from '../../../reducers'
import {
  HOME_FILES_MAKE_FEATURED_SUCCESS,
  HOME_FILES_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('makeFeatured()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch files feature actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const uids = [1, 2, 3]
    const featured = true
    const objectType = OBJECT_TYPES.FILE
    const link = '/api/files/feature'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const messages = [
        { type: 'warning', message: 'message 1' },
        { type: 'success', message: 'message 2' },
      ]

      fetchMock.put(link, { meta: messages })

      return store.dispatch(makeFeatured(link, objectType, uids, featured)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_MAKE_FEATURED_SUCCESS, payload: []},
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
      fetchMock.put(link, { status: 500, body: {}})

      return store.dispatch(makeFeatured(link, objectType, uids, featured)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_FETCH_FAILURE, payload: 'everybodyFiles' },
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
