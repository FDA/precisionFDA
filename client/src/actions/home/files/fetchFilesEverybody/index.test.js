import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchFilesEverybody from './index'
import reducer from '../../../../reducers'
import {
  HOME_FILES_FETCH_START,
  HOME_FILES_FETCH_SUCCESS,
  HOME_FILES_FETCH_FAILURE,
} from '../../types'
import { HOME_FILE_TYPES } from '../../../../constants'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeFileShape'


describe('fetchFilesEverybody()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const files = ['file1', 'file2']
    const pagination = {}
    const path = []

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/files/everybody?page=1'
    MAP.mapToHomeFile = jest.fn((file) => (file))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { files, pagination, path })

      return store.dispatch(fetchFilesEverybody()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_FETCH_START, payload: HOME_FILE_TYPES.EVERYBODY },
          { type: HOME_FILES_FETCH_SUCCESS, payload: { filesType: HOME_FILE_TYPES.EVERYBODY, files, pagination, path }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchFilesEverybody()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FILES_FETCH_START, payload: HOME_FILE_TYPES.EVERYBODY },
          { type: HOME_FILES_FETCH_FAILURE, payload: HOME_FILE_TYPES.EVERYBODY },
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
