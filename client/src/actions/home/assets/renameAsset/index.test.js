import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import renameAsset from '.'
import reducer from '../../../../reducers'
import {
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import { HOME_ASSETS_MODALS } from '../../../../constants'


describe('renameAsset()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const renameLink = '/api/assets/rename'
    const uid = '123'
    const name = 'newName'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(renameLink, {})

      return store.dispatch(renameAsset(renameLink, name, uid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSETS_MODAL_ACTION_START, payload: HOME_ASSETS_MODALS.RENAME },
          { type: HOME_ASSETS_MODAL_ACTION_SUCCESS, payload: HOME_ASSETS_MODALS.RENAME },
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Asset was successfully renamed.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(renameLink, { status: 500, body: {}})

      return store.dispatch(renameAsset(renameLink, name, uid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSETS_MODAL_ACTION_START, payload: HOME_ASSETS_MODALS.RENAME },
          { type: HOME_ASSETS_MODAL_ACTION_FAILURE, payload: HOME_ASSETS_MODALS.RENAME },
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
