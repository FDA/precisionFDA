import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import renameFile from '.'
import reducer from '../../../../reducers'
import {
  SPACE_RENAME_FILE_START,
  SPACE_RENAME_FILE_SUCCESS,
  SPACE_RENAME_FILE_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('renameFiles()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const renameLink = '/api/file/rename'
    const name = 'newFileName'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.put(renameLink, {})

      return store.dispatch(renameFile(renameLink, name)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_RENAME_FILE_START, payload: {}},
          { type: SPACE_RENAME_FILE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'File was successfully renamed.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.put(renameLink, { status: 500, body: {}})

      return store.dispatch(renameFile(renameLink, name)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_RENAME_FILE_START, payload: {}},
          { type: SPACE_RENAME_FILE_FAILURE, payload: {}},
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
