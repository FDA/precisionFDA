import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import editSpace from './index'
import reducer from '../../../reducers'
import {
  SPACE_EDITING_START,
  SPACE_EDITING_SUCCESS,
  SPACE_EDITING_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('editSpace()', () => {
  const store = mockStore(reducer({
    spaces: {
      space: {
        data: {
          links: {
            update: '/space/update',
          },
        },
      },
    },
  }, { type: undefined }))

  afterEach(() => {
    fetchMock.reset()
    store.clearActions()
  })

  describe('successful response', () => {
    it('dispatches correct actions', () => {
      const params = {}
      fetchMock.put('/space/update', {})

      return store.dispatch(editSpace(params)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_EDITING_START, payload: {}},
          { type: SPACE_EDITING_SUCCESS, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
            style: 'success',
            message: 'Space was successfully updated.',
            type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })

  it('dispatches correct actions on failure', () => {
    const response = { errors: { messages: ['some errors']}}
    const params = {}

    fetchMock.put('/space/update', { body: response, status: 400 })

    return store.dispatch(editSpace(params)).then(() => {
      const actions = store.getActions()

      expect(actions).toEqual([
        { type: SPACE_EDITING_START, payload: {}},
        { type: SPACE_EDITING_FAILURE,payload: { errors: { messages:['some errors']}}},
         {
          type: 'ALERT_SHOW_ABOVE_ALL',
          payload: { message: 'some errors', type: 'ALERT_ABOVE_ALL' },
        },
      ])
    })
  })
})
