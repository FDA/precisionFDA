import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { deleteSpace } from '.'
import reducer from '../../../reducers'
import {
  DELETE_SPACE_START,
  DELETE_SPACE_SUCCESS,
  DELETE_SPACE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('deleteSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = 'space/id/delete'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, {})

      return store.dispatch(deleteSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: DELETE_SPACE_START, payload: {}},
          { type: DELETE_SPACE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Space was deleted successfully.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(deleteSpace(link)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: DELETE_SPACE_START, payload: {}},
          { type: DELETE_SPACE_FAILURE, payload: {}},
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
