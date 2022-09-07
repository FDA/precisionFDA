import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchDatabases from './index'
import reducer from '../../../../reducers'
import {
  HOME_DATABASES_FETCH_START,
  HOME_DATABASES_FETCH_SUCCESS,
  HOME_DATABASES_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { HOME_DATABASE_TYPES, ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeDatabaseShape'


describe('fetchDatabases()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const databases = ['database1', 'database2']
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/dbclusters?page=1'
    MAP.mapToHomeDatabase = jest.fn((database) => (database))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { databases, pagination })

      return store.dispatch(fetchDatabases()).then(() => {
        const actions = store.getActions()
        expect(actions).toEqual([
          { type: HOME_DATABASES_FETCH_START, payload: HOME_DATABASE_TYPES.PRIVATE },
          { type: HOME_DATABASES_FETCH_SUCCESS,
            payload: {
              databasesType: HOME_DATABASE_TYPES.PRIVATE,
              databases: [],
              pagination,
            }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchDatabases()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASES_FETCH_START, payload: HOME_DATABASE_TYPES.PRIVATE },
          { type: HOME_DATABASES_FETCH_FAILURE, payload: HOME_DATABASE_TYPES.PRIVATE },
          { type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong! Wrong response status.',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
