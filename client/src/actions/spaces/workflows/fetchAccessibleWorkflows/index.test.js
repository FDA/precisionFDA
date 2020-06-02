import fetchMock from 'fetch-mock'

import { mockStore } from '../../../../../test/helper'
import fetchAccessibleWorkflows from '.'
import reducer from '../../../../reducers'
import {
  FETCH_ACCESSIBLE_WORKFLOWS_START,
  FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS,
  FETCH_ACCESSIBLE_WORKFLOWS_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import * as MAP from '../../../../views/shapes/AccessibleObjectsShape'


describe('fetchAccessibleWorkflows()', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  describe('dispatch actions', () => {
    const url = '/api/spaces/editable_spaces'
    const workflows = ['workflow1', 'workflow2']
    const store = mockStore(reducer({
      context: {
        links: {
          accessible_workflows: url,
        },
      },
    }, { type: undefined }))

    afterEach(() => {
      store.clearActions()
    })

    it('fetchAccessibleWorkflows dispatches correct actions on success response', () => {
      fetchMock.post(url, workflows)
      MAP.mapToAccessibleWorkflow = jest.fn((workflow) => workflow)

      return store.dispatch(fetchAccessibleWorkflows()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_WORKFLOWS_START, payload: {}},
          { type: FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS, payload: workflows },
        ])
      })
    })

    it('fetchAccessibleWorkflows dispatches correct actions on failure response', () => {
      fetchMock.post(url, { status: 500, body: {}})

      return store.dispatch(fetchAccessibleWorkflows()).then(() => {
        const actions = store.getActions()

        expect(actions).toEqual([
          { type: FETCH_ACCESSIBLE_WORKFLOWS_START, payload: {}},
          { type: FETCH_ACCESSIBLE_WORKFLOWS_FAILURE, payload: {}},
          showAlertAboveAll({ message: 'Something went wrong!' }),
        ])
      })
    })
  })
})
