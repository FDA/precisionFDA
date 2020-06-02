import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAccessibleFiles from '.'
import reducer from '../../../../reducers'
import {
  FETCH_ACCESSIBLE_FILES_START,
  FETCH_ACCESSIBLE_FILES_SUCCESS,
  FETCH_ACCESSIBLE_FILES_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import * as MAP from '../../../../views/shapes/AccessibleObjectsShape'


describe('fetchAccessibleFiles()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const url = '/api/spaces/editable_spaces'
    const files = ['file1', 'file2']
    const store = mockStore(reducer({
      context: {
        links: {
          accessible_files: url,
        },
      },
    }, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('fetchAccessibleFiles dispatches correct actions on success response', () => {
      fetchMock.post(url, files)
      MAP.mapToAccessibleFile = jest.fn((file) => file)

      return store.dispatch(fetchAccessibleFiles()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_FILES_START, payload: {}},
          { type: FETCH_ACCESSIBLE_FILES_SUCCESS, payload: files },
        ])
      })
    })

    it('fetchAccessibleFiles dispatches correct actions on failure response', () => {
      fetchMock.post(url, { status: 500, body: {}})

      return store.dispatch(fetchAccessibleFiles()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_FILES_START, payload: {}},
          { type: FETCH_ACCESSIBLE_FILES_FAILURE, payload: {}},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
