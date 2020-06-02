import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchSpace } from '.'
import reducer from '../../../reducers'
import {
  SPACE_FETCH_START,
  SPACE_FETCH_SUCCESS,
  SPACE_FETCH_FAILURE,
} from '../types'
import * as MAP from '../../../views/shapes/SpaceShape'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchSpace()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const spaceId = 'some id'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(`/api/spaces/${spaceId}`, { space: {}})
      MAP.mapToSpace = jest.fn(() => ({ space: {}}))

      return store.dispatch(fetchSpace(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_FETCH_START, payload: {}},
          { type: SPACE_FETCH_SUCCESS, payload: { space: {}}},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(`/api/spaces/${spaceId}`, { status: 500, body: {}})

      return store.dispatch(fetchSpace(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_FETCH_START, payload: {}},
          { type: SPACE_FETCH_FAILURE, payload: {}},
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
