import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import fetchAttachingItems from '.'
import reducer from '../../../reducers'
import {
  HOME_FETCH_ATTACHING_ITEMS_SUCCESS,
  HOME_FETCH_ATTACHING_ITEMS_START,
  HOME_FETCH_ATTACHING_ITEMS_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchAttachingItems()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const copyLink = '/api/list_notes'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(copyLink, {
        editable: true,
        fields: ['title', 'note_type'],
      })

      return store.dispatch(fetchAttachingItems()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FETCH_ATTACHING_ITEMS_START, payload: {}},
          { type: HOME_FETCH_ATTACHING_ITEMS_SUCCESS, payload: {
            editable: true,
            fields: ['title', 'note_type'],
          }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(copyLink, { status: 500, body: {}})

      return store.dispatch(fetchAttachingItems()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_FETCH_ATTACHING_ITEMS_START, payload: {}},
          { type: HOME_FETCH_ATTACHING_ITEMS_FAILURE, payload: {}},
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
