import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { addDataToSpace } from '.'
import reducer from '../../../reducers'
import {
  ADD_DATA_TO_SPACE_START,
  ADD_DATA_TO_SPACE_SUCCESS,
  ADD_DATA_TO_SPACE_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('addDataToSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({
      spaces: {
        files: {
          entries: [],
        },
      },
    }, { type: undefined }))
    const link = '/api/spaces/undefined/add_data/'
    const objects = [{ uid: '123' }]

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.post(link, {})
      fetchMock.get('/api/spaces/undefined/files', { entries: [], meta: {}})

      return store.dispatch(addDataToSpace(objects)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: ADD_DATA_TO_SPACE_START, payload: {}},
          { type: ADD_DATA_TO_SPACE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Objects successfully added to space.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(link, { status: 500, body: {}})

      return store.dispatch(addDataToSpace(objects)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: ADD_DATA_TO_SPACE_START, payload: {}},
          { type: ADD_DATA_TO_SPACE_FAILURE, payload: {}},
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
