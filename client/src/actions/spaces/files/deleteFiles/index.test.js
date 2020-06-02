import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import deleteFiles from '.'
import reducer from '../../../../reducers'
import {
  SPACE_DELETE_FILES_START,
  SPACE_DELETE_FILES_SUCCESS,
  SPACE_DELETE_FILES_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('deleteFiles()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const files = [{ id: 1 }, { id: 2 }]
    const deleteLink = '/api/files/delete'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(deleteLink, {})

      return store.dispatch(deleteFiles(deleteLink, files)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_DELETE_FILES_START, payload: {}},
          { type: SPACE_DELETE_FILES_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: '2 file(s) successfully deleteted.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(deleteLink, { status: 500, body: {}})

      return store.dispatch(deleteFiles(deleteLink, files)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_DELETE_FILES_START, payload: {}},
          { type: SPACE_DELETE_FILES_FAILURE, payload: {}},
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
