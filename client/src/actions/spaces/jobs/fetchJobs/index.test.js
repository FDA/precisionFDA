import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchJobs from '.'
import reducer from '../../../../reducers'
import * as API from '../../../../api/spaces'
import {
  SPACE_JOBS_FETCH_START,
  SPACE_JOBS_FETCH_SUCCESS,
  SPACE_JOBS_FETCH_FAILURE,
} from '../../types'
import * as MAP from '../../../../views/shapes/JobShape'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('fetchJobs()', () => {
  const spaceId = 1

  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const jobs = [
      { id: 1, name: 'job-1', scope: 'public', created_at: '2020-03-01',
        state: 'Done', tags: ['tag_one', 'tag_two']},
      { id: 2, name: 'job-2', scope: 'private', created_at: '2020-03-24',
        state: 'Failed', tags: ['tag_four', 'tag_two']},
    ]

    const store = mockStore(reducer({}, { type: undefined }))
    const url = `/api/spaces/${spaceId}/jobs`

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { jobs: jobs })

      return store.dispatch(fetchJobs(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_JOBS_FETCH_START, payload: {}},
          { type: SPACE_JOBS_FETCH_SUCCESS, payload: { jobs: jobs.map(MAP.mapToJob) }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchJobs(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_JOBS_FETCH_START, payload: {}},
          { type: SPACE_JOBS_FETCH_FAILURE, payload: {}},
          { type: ALERT_SHOW_ABOVE_ALL, payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })

  describe('params building', () => {
    beforeEach(() => {
      API.getJobs = jest.fn(() => Promise.resolve({ payload: { jobs: []}}))
    })

    describe('when sort type is given', () => {
      const sortType = 'some order'
      const sortDirection = 'some direction'
      const store = mockStore(reducer({
        spaces: {
          jobs: {
            sortType,
            sortDirection,
          },
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        const expectedQuery = { order_by: sortType, order_dir: sortDirection }

        return store.dispatch(fetchJobs(spaceId)).then(() => {
          expect(API.getJobs.mock.calls.length).toEqual(1)
          expect(API.getJobs.mock.calls[0][1]).toEqual(expectedQuery)
        })
      })
    })

    describe('when sort type is not given', () => {
      const store = mockStore(reducer({
        spaces: {
          jobs: {},
        },
      }, { type: undefined }))

      it("doesn't pass it to API call", () => {
        return store.dispatch(fetchJobs(spaceId)).then(() => {
          expect(API.getJobs.mock.calls.length).toEqual(1)
          expect(API.getJobs.mock.calls[0][1]).toEqual({})
        })
      })
    })
  })
})
