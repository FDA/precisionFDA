import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchFilesByAction from '.'
import reducer from '../../../../reducers'
import {
  HOME_FETCH_FILES_BY_ACTION_START,
  HOME_FETCH_FILES_BY_ACTION_SUCCESS,
  HOME_FETCH_FILES_BY_ACTION_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import * as MAP from '../../../../views/shapes/FileShape'


describe('fetchFilesByAction()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const url = '/api/files/download_list'
    const files = ['file1', 'file2']
    const ids = []
    const action = 'delete'
    const store = mockStore(reducer({
      spaces: {
        files: {
          actionModal: { files: []},
        },
      },
    }, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })
    it('fetchSpaceLockToggle dispatches correct actions on success response', () => {

      fetchMock.post(url, files)
      MAP.mapToFileActionItem = jest.fn((file) => file)

      return store.dispatch(fetchFilesByAction(ids, action)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FETCH_FILES_BY_ACTION_START, payload: action },
          { type: HOME_FETCH_FILES_BY_ACTION_SUCCESS, payload: { action, files }},
        ])
      })
    })

    it('fetchSpaceLockToggle dispatches correct actions on failure response', () => {
      fetchMock.post(url, { status: 500, body: {}})

      return store.dispatch(fetchFilesByAction(ids, action)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FETCH_FILES_BY_ACTION_START, payload: action },
          { type: HOME_FETCH_FILES_BY_ACTION_FAILURE, payload: {}},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
