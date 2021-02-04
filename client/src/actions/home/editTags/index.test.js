import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import editTags from '.'
import reducer from '../../../reducers'
import {
  HOME_EDIT_APP_TAGS_START,
  HOME_EDIT_APP_TAGS_SUCCESS,
  HOME_EDIT_APP_TAGS_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL, OBJECT_TYPES } from '../../../constants'


describe('editTags()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const editLink = '/api/set_tags'
    const uid = '1'
    const tags = [1, 2, 3]
    const suggestedTags = [1, 2]
    const objectType = OBJECT_TYPES.APP

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(editLink, {})

      return store.dispatch(editTags(uid, tags, suggestedTags, objectType)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EDIT_APP_TAGS_START, payload: {}},
          { type: HOME_EDIT_APP_TAGS_SUCCESS, payload: {}},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(editLink, { status: 500, body: {}})

      return store.dispatch(editTags(uid, tags, suggestedTags, objectType)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_EDIT_APP_TAGS_START, payload: {}},
          { type: HOME_EDIT_APP_TAGS_FAILURE, payload: {}},
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
