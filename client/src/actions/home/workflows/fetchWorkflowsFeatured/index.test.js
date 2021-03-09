import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchWorkflows from './index'
import reducer from '../../../../reducers'
import {
  HOME_WORKFLOWS_FETCH_START,
  HOME_WORKFLOWS_FETCH_SUCCESS,
  HOME_WORKFLOWS_FETCH_FAILURE,
} from '../../workflows/types'
import { HOME_WORKFLOW_TYPES } from '../../../../constants'
import { ALERT_SHOW_ABOVE_ALL } from '../../../alertNotifications/types'
import { ALERT_ABOVE_ALL } from '../../../../constants'
import * as MAP from '../../../../views/shapes/HomeWorkflowsShape'


describe('fetchWorkflows()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const workflows = ['workflow1', 'workflow2']
    const pagination = {}

    const store = mockStore(reducer({}, { type: undefined }))
    const url = '/api/workflows/featured?page=1'
    MAP.mapToHomeWorkflow = jest.fn((workflow) => (workflow))

    afterEach(() => {
      store.clearActions()
    })

    it('dispatches correct actions on success response', () => {
      fetchMock.get(url, { workflows, pagination })

      return store.dispatch(fetchWorkflows()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          {
            type: HOME_WORKFLOWS_FETCH_START,
            payload: HOME_WORKFLOW_TYPES.FEATURED,
          },
          {
            type: HOME_WORKFLOWS_FETCH_SUCCESS,
            payload: {
              workflowsType: HOME_WORKFLOW_TYPES.FEATURED,
              workflows,
              pagination,
            },
          },
        ])
      })
    })

    it('dispatches correct actions on failure response', () => {
      fetchMock.get(url, { status: 500, body: {}})

      return store.dispatch(fetchWorkflows()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          {
            type: HOME_WORKFLOWS_FETCH_START,
            payload: HOME_WORKFLOW_TYPES.FEATURED,
          },
          {
            type: HOME_WORKFLOWS_FETCH_FAILURE,
            payload: HOME_WORKFLOW_TYPES.FEATURED,
          },
          {
            type: ALERT_SHOW_ABOVE_ALL,
            payload: {
              message: 'Something went wrong!',
              type: ALERT_ABOVE_ALL,
            },
          },
        ])
      })
    })
  })
})

