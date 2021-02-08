import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchWorkflows from '.'
import reducer from '../../../../reducers'
import * as API from '../../../../api/spaces'
import {
  SPACE_WORKFLOWS_FETCH_START,
  SPACE_WORKFLOWS_FETCH_SUCCESS,
  SPACE_WORKFLOWS_FETCH_FAILURE,
} from '../../types'
import * as MAP from '../../../../views/shapes/WorkflowShape'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'


describe('fetchWorkflows()', () => {
  const spaceId = 1
  const page = 1

  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const workflows = ['wf1', 'wf2']
    const links = {}
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = `/api/workflows?page=${page}&space_id=${spaceId}`
    MAP.mapToWorkflow = jest.fn((wf) => (wf))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { workflows: workflows, meta: { links, pagination }})

      return store.dispatch(fetchWorkflows(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_WORKFLOWS_FETCH_START, payload: {}},
          { type: SPACE_WORKFLOWS_FETCH_SUCCESS, payload: { workflows, links, pagination }},
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchWorkflows(spaceId)).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: SPACE_WORKFLOWS_FETCH_START, payload: {}},
          { type: SPACE_WORKFLOWS_FETCH_FAILURE, payload: {}},
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
      API.getWorkflows = jest.fn(() => Promise.resolve({ payload: { workflows: []}}))
    })

    describe('when sort type is given', () => {
      const sortType = 'some order'
      const sortDirection = 'some direction'
      const store = mockStore(reducer({
        spaces: {
          workflows: {
            sortType,
            sortDirection,
            pagination: {},
          },
        },
      }, { type: undefined }))

      it('passes it to API call', () => {
        const expectedQuery = { order_by: sortType, order_dir: sortDirection }

        return store.dispatch(fetchWorkflows(spaceId)).then(() => {
          expect(API.getWorkflows.mock.calls.length).toEqual(1)
          expect(API.getWorkflows.mock.calls[0][1]).toEqual(expectedQuery)
        })
      })
    })

    describe('when sort type is not given', () => {
      const store = mockStore(reducer({
        spaces: {
          workflows: {
            pagination: {},
          },
        },
      }, { type: undefined }))

      it("doesn't pass it to API call", () => {
        return store.dispatch(fetchWorkflows(spaceId)).then(() => {
          expect(API.getWorkflows.mock.calls.length).toEqual(1)
          expect(API.getWorkflows.mock.calls[0][1]).toEqual({})
        })
      })
    })
  })
})
