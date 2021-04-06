import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchChallenge } from '.'
import reducer from '../../../reducers'
import {
  CHALLENGE_FETCH_START,
  CHALLENGE_FETCH_SUCCESS,
  CHALLENGE_FETCH_FAILURE,
} from '../types'
import * as MAP from '../../../views/shapes/ChallengeShape'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchChallenge()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const challengeId = 'some id'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(`/api/challenges/${challengeId}`, { challenge: {}})
      MAP.mapToChallenge = jest.fn(() => ({ challenge: {}}))

      return store.dispatch(fetchChallenge(challengeId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: CHALLENGE_FETCH_START, payload: {}},
          { type: CHALLENGE_FETCH_SUCCESS, payload: { challenge: {}}},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(`/api/challenges/${challengeId}`, { status: 500, body: {}})

      return store.dispatch(fetchChallenge(challengeId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: CHALLENGE_FETCH_START, payload: {}},
          { type: CHALLENGE_FETCH_FAILURE, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong loading the Challenge!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
