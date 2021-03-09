import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import assignToChallenge from '.'
import reducer from '../../../../reducers'
import {
  HOME_ASSIGN_TO_CHALLENGE_START,
  HOME_ASSIGN_TO_CHALLENGE_SUCCESS,
  HOME_ASSIGN_TO_CHALLENGE_FAILURE,
} from '../../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('assignToChallenge()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))
    const challengeId = 1
    const appUid = 2
    const copyLink = '/api/assign_app'

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const message = { type: 'success', text: 'mess 1' }
      fetchMock.post(copyLink, { message })

      return store.dispatch(assignToChallenge(copyLink, challengeId, appUid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSIGN_TO_CHALLENGE_START, payload: {}},
          { type: HOME_ASSIGN_TO_CHALLENGE_SUCCESS, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'mess 1',
              style: 'success',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.post(copyLink, { status: 500, body: {}})

      return store.dispatch(assignToChallenge(copyLink, challengeId, appUid)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: HOME_ASSIGN_TO_CHALLENGE_START, payload: {}},
          { type: HOME_ASSIGN_TO_CHALLENGE_FAILURE, payload: {}},
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
