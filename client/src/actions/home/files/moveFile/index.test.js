import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import { filesMove } from '.'
import reducer from '../../../../reducers'
import {
  HOME_MOVE_FILE_START,
  HOME_MOVE_FILE_SUCCESS,
  HOME_MOVE_FILE_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('filesMove()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const nodeIds = [1, 2, 3]
    const targetId = 2
    const link = 'api/files/move'
    const scope = 'private'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, {})

      return store.dispatch(filesMove(nodeIds, targetId, link, scope)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_MOVE_FILE_START, payload: {}},
          { type: HOME_MOVE_FILE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Selected items successfully moved',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(filesMove(nodeIds, targetId, link, scope)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_MOVE_FILE_START, payload: {}},
          { type: HOME_MOVE_FILE_FAILURE, payload: {}},
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
