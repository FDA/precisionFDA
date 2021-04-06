import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { proposeChallenge } from '.'
import reducer from '../../../reducers'
import {
  PROPOSE_CHALLENGE_FETCH_START,
  PROPOSE_CHALLENGE_FETCH_SUCCESS,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('proposeChallenge()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const params = {

      }
      fetchMock.post('/api/challenges/propose', params)

      return store.dispatch(proposeChallenge(params)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: PROPOSE_CHALLENGE_FETCH_START, payload: {}},
          { type: PROPOSE_CHALLENGE_FETCH_SUCCESS, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Your challenge proposal has been received.',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
