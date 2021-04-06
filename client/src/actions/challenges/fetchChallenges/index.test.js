import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchChallenges } from '.'
import reducer from '../../../reducers'
import {
  CHALLENGES_FETCH_START,
  CHALLENGES_FETCH_SUCCESS,
  CHALLENGES_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchChallenges()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get('/api/challenges', { challenges: [], meta: {}})

      return store.dispatch(fetchChallenges()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: CHALLENGES_FETCH_START, payload: {}},
          { type: CHALLENGES_FETCH_SUCCESS, payload: { challenges: [], pagination: {}}},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/challenges', { status: 500, body: {}})

      return store.dispatch(fetchChallenges()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: CHALLENGES_FETCH_START, payload: {}},
          { type: CHALLENGES_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong loading Challenges!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
