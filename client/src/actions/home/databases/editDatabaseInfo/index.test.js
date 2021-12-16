import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import editDatabaseInfo from '.'
import reducer from '../../../../reducers'
import {
  HOME_DATABASE_EDIT_INFO_FAILURE,
  HOME_DATABASE_EDIT_INFO_START,
  HOME_DATABASE_EDIT_INFO_SUCCESS,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('editDatabaseInfo()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const link = '/api/dbclusters/'
    const dxid = '1'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.put(link, {})

      return store.dispatch(editDatabaseInfo(link, dxid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASE_EDIT_INFO_START, payload: {}},
          { type: HOME_DATABASE_EDIT_INFO_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'The Database info was successfully changed.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.put(link, { status: 500, body: {}})

      return store.dispatch(editDatabaseInfo(link, dxid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_DATABASE_EDIT_INFO_START, payload: {}},
          { type: HOME_DATABASE_EDIT_INFO_FAILURE, payload: {}},
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
