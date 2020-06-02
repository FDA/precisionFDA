import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { lockSpace } from '.'
import reducer from '../../../reducers'
import {
  LOCK_SPACE_START,
  LOCK_SPACE_SUCCESS,
  LOCK_SPACE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'
import * as MAP from '../../../views/shapes/SpaceShape'


describe('lockSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = 'space/id/lock'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, { space: {}})
      fetchMock.get('/api/spaces/undefined', { space: {}})
      MAP.mapToSpace = jest.fn(() => ({ space: {}}))

      return store.dispatch(lockSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: LOCK_SPACE_START, payload: {}},
          { type: LOCK_SPACE_SUCCESS, payload: { space: {}}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Space successfully locked.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
          // {
          //   type: SPACE_FETCH_START, payload: {},
          // },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(lockSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: LOCK_SPACE_START, payload: {}},
          { type: LOCK_SPACE_FAILURE, payload: {}},
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
