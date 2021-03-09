import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchFiles from '.'
import reducer from '../../../../reducers'
import * as API from '../../../../api/spaces'
import {
  SPACE_FILES_FETCH_START,
  SPACE_FILES_FETCH_SUCCESS,
  SPACE_FILES_FETCH_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/FileShape'


describe('fetchFiles()', () => {
  const spaceId = 1
  const folderId = null
  const page = 1

  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const files = ['file1 ', 'file2', 'file3']
    const links = { link: 'link' }
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = ` /api/files?folder_id&page=${page}&space_id=${spaceId}`
    MAP.mapToFile = jest.fn((file) => (file))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { entries: files, meta: { links, pagination }})

      return store.dispatch(fetchFiles(spaceId, folderId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_FILES_FETCH_START, payload: {}},
          { type: SPACE_FILES_FETCH_SUCCESS, payload: { files, links, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}}, { folder_id: folderId })

      return store.dispatch(fetchFiles(spaceId, folderId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_FILES_FETCH_START, payload: {}},
          { type: SPACE_FILES_FETCH_FAILURE, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })

  describe('params building', () => {
    beforeEach(() => {
      API.getFiles = jest.fn(() => {
        return Promise.resolve({ payload: { files: []}})
      })
    })

    describe('when sort type is given', () => {
      const sortType = 'some order'
      const sortDirection = 'some direction'
      const store = mockStore(reducer({
        spaces: {
          files: {
            sortType,
            sortDirection,
            pagination: {},
          },
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        const expectedQuery = { order_by: sortType, order_dir: sortDirection, folder_id: null }

        return store.dispatch(fetchFiles(spaceId, folderId)).then(() => {
          expect(API.getFiles.mock.calls.length).toEqual(1)
          expect(API.getFiles.mock.calls[0][1]).toEqual(expectedQuery)
        })
      })
    })

    describe('when sort type is not given', () => {
      const store = mockStore(reducer({
        spaces: {
          files: {
            pagination: {},
          },
        },
      }, { type: undefined }))

      it("doesn't pass it to API call", () => {
        console.info( API.getFiles.mock.calls )

        return store.dispatch(fetchFiles(spaceId, folderId)).then(() => {
          expect(API.getFiles.mock.calls.length).toEqual(1)
          expect(API.getFiles.mock.calls[0][1]).toEqual({ folder_id: folderId })
        })
      })
    })
  })
})
