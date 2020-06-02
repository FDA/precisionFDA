import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { unlockSpace } from '.'
import reducer from '../../../reducers'
import {
  UNLOCK_SPACE_START,
  UNLOCK_SPACE_SUCCESS,
  UNLOCK_SPACE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'
import * as MAP from '../../../views/shapes/SpaceShape'


describe('unlockSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = 'space/id/unlock'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, { space: {}})
      MAP.mapToSpace = jest.fn(() => ({ space: {}}))

      return store.dispatch(unlockSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: UNLOCK_SPACE_START, payload: {}},
          { type: UNLOCK_SPACE_SUCCESS, payload: { space: {}}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Space successfully unlocked.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(unlockSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: UNLOCK_SPACE_START, payload: {}},
          { type: UNLOCK_SPACE_FAILURE, payload: {}},
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
