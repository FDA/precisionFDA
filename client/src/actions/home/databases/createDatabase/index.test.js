import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import createDatabase from '.'
import reducer from '../../../../reducers'
import {
  HOME_DATABASE_CREATE_START,
  HOME_DATABASE_CREATE_SUCCESS,
  HOME_DATABASE_CREATE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('createDatabase()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const response = { db_cluster: { dxid: 'dxid' }}
    const db_cluster = {}
    const createLink = '/api/dbclusters/'

    afterEach(() => { store.clearActions() })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(createLink, response)

      return store.dispatch(createDatabase(createLink, db_cluster)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASE_CREATE_START, payload: {}},
          { type: HOME_DATABASE_CREATE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'The Database has been successfully created',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(createLink, { status: 500, body: {}})

      return store.dispatch(createDatabase(createLink, db_cluster)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASE_CREATE_START, payload: {}},
          { type: HOME_DATABASE_CREATE_FAILURE, payload: {}},
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
