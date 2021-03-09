import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import createFolder from '.'
import reducer from '../../../../reducers'
import {
  HOME_ADD_FOLDER_START,
  HOME_ADD_FOLDER_SUCCESS,
  HOME_ADD_FOLDER_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('createFolder()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const createFolderLink = '/api/file/create_folder'
    const name = 'newFolderName'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(createFolderLink, {})

      return store.dispatch(createFolder(createFolderLink, name)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ADD_FOLDER_START, payload: {}},
          { type: HOME_ADD_FOLDER_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Folder successfully created.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(createFolderLink, { status: 500, body: {}})

      return store.dispatch(createFolder(createFolderLink, name)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ADD_FOLDER_START, payload: {}},
          { type: HOME_ADD_FOLDER_FAILURE, payload: {}},
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
