import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchExperts } from '.'
import {
  EXPERTS_LIST_FETCH_START,
  EXPERTS_LIST_FETCH_SUCCESS,
  EXPERTS_LIST_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'
import reducer from '../../../reducers'


describe('fetchExperts()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const experts = []
      fetchMock.get('/api/experts', { experts: experts, meta: {}})

      return store.dispatch(fetchExperts()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: EXPERTS_LIST_FETCH_START, payload: {}},
          { type: EXPERTS_LIST_FETCH_SUCCESS, payload: { items: experts, pagination: {}, year: undefined }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/experts', { status: 500, body: {}})

      return store.dispatch(fetchExperts()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: EXPERTS_LIST_FETCH_START, payload: {}},
          { type: EXPERTS_LIST_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong loading Experts!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
