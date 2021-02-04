import reducer from './index'
import {
  HOME_WORKFLOWS_FETCH_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE,
  HOME_WORKFLOWS_RESET_FILTERS,
} from '../../../actions/home/workflows/types'
import { HOME_WORKFLOW_TYPES } from '../../../constants'


describe('fetch private workflows start', () => {
  it('HOME_WORKFLOWS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_FETCH_START, payload: HOME_WORKFLOW_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_WORKFLOW_TYPES.PRIVATE]: {
        isFetching: true,
      },
    })
  })
})

describe('fetch featured workflows start', () => {
  it('HOME_WORKFLOWS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_FETCH_START, payload: HOME_WORKFLOW_TYPES.FEATURED }

    expect(reducer(initialState, action)).toEqual({
      [HOME_WORKFLOW_TYPES.FEATURED]: {
        isFetching: true,
      },
    })
  })
})

describe.skip('fetch workflow details', () => {
  it('HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      workflowDetails: {
        isFetching: true,
        workflow: {},
        meta: {},
      },
    })
  })

  it('HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS, payload: { workflow: 'workflow', meta: 'meta' }}

    expect(reducer(initialState, action)).toEqual({
      workflowDetails: {
        isFetching: false,
        workflow: 'workflow',
        meta: 'meta',
      },
    })
  })

  it('HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      workflowDetails: {
        isFetching: false,
      },
    })
  })
})

describe('reset filter value', () => {
  it('HOME_WORKFLOWS_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: HOME_WORKFLOWS_RESET_FILTERS, payload: { workflowsType: HOME_WORKFLOW_TYPES.PRIVATE }}

    expect(reducer(initialState, action)).toEqual({
      [HOME_WORKFLOW_TYPES.PRIVATE]: {
        filters: {
          sortType: null,
          sortDirection: null,
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          totalPages: null,
          totalCount: null,
          fields: new Map(),
        },
      },
    })
  })
})
