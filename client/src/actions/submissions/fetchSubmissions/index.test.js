import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../test/helper'
import { fetchSubmissions, fetchMyEntries } from '.'
import reducer from '../../../reducers'
import {
  SUBMISSIONS_FETCH_START,
  SUBMISSIONS_FETCH_SUCCESS,
  SUBMISSIONS_FETCH_FAILURE,
  MY_ENTRIES_FETCH_START,
  MY_ENTRIES_FETCH_SUCCESS,
  MY_ENTRIES_FETCH_FAILURE,
} from '../types'
import { ALERT_SHOW_ABOVE_ALL } from '../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('fetchSubmissions()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const payload = { submissions: []}
      fetchMock.get('/api/submissions?challenge_id=123', payload)

      return store.dispatch(fetchSubmissions(123)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SUBMISSIONS_FETCH_START, payload: {}},
          { type: SUBMISSIONS_FETCH_SUCCESS, payload: payload.submissions },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/submissions?challenge_id=123', { status: 500, body: {}})

      return store.dispatch(fetchSubmissions(123)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SUBMISSIONS_FETCH_START, payload: {}},
          { type: SUBMISSIONS_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong loading submissions!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})


describe('fetchMyEntries()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const store = mockStore(reducer({}, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      const payload = { submissions: []}
      fetchMock.get('/api/submissions/my_entries?challenge_id=123', payload)

      return store.dispatch(fetchMyEntries(123)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: MY_ENTRIES_FETCH_START, payload: {}},
          { type: MY_ENTRIES_FETCH_SUCCESS, payload: payload.submissions },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get('/api/submissions/my_entries?challenge_id=123', { status: 500, body: {}})

      return store.dispatch(fetchMyEntries(123)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: MY_ENTRIES_FETCH_START, payload: {}},
          { type: MY_ENTRIES_FETCH_FAILURE, payload: {}},
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong loading submissions!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})
