import reducer from './index'
import {
  HOME_EXECUTIONS_FETCH_START,
  HOME_EXECUTIONS_FETCH_SUCCESS,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS,
  HOME_EXECUTIONS_SHOW_MODAL,
  HOME_EXECUTIONS_HIDE_MODAL,
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../../../actions/home/executions/types'
import { HOME_ENTRIES_TYPES } from '../../../constants'


describe('fetch private executions', () => {
  it('HOME_EXECUTIONS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTIONS_FETCH_START, payload: HOME_ENTRIES_TYPES.PRIVATE }

    expect(reducer(initialState, action)).toEqual({
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        isFetching: true,
      },
    })
  })

  it('HOME_EXECUTIONS_FETCH_SUCCESS', () => {
    const initialState = {
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        filters: {},
      },
    }
    const action = { type: HOME_EXECUTIONS_FETCH_SUCCESS, payload: { executionsType: HOME_ENTRIES_TYPES.PRIVATE, executions: [], pagination: {}}}

    expect(reducer(initialState, action)).toEqual({
      [HOME_ENTRIES_TYPES.PRIVATE]: {
        isFetching: false,
        isCheckedAll: false,
        executions: [],
        filters: {},
      },
    })
  })
})

describe('fetch execution details', () => {
  it('HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START, payload: {}}

    expect(reducer(initialState, action)).toEqual({
      executionDetails: {
        isFetching: true,
        execution: {},
        meta: {},
      },
    })
  })

  it('HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS, payload: { execution: {}, meta: {}}}

    expect(reducer(initialState, action)).toEqual({
      executionDetails: {
        isFetching: false,
        execution: {},
        meta: {},
      },
    })
  })
})

describe('modals', () => {
  it('HOME_EXECUTIONS_SHOW_MODAL', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTIONS_SHOW_MODAL, payload: 'modal1' }

    expect(reducer(initialState, action)).toEqual({
      modal1: {
        isOpen: true,
      },
    })
  })

  it('HOME_EXECUTIONS_HIDE_MODAL', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTIONS_HIDE_MODAL, payload: 'modal1' }

    expect(reducer(initialState, action)).toEqual({
      modal1: {
        isOpen: false,
      },
    })
  })

  it('HOME_EXECUTION_MODAL_ACTION_START', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTION_MODAL_ACTION_START, payload: 'modal' }

    expect(reducer(initialState, action)).toEqual({
      'modal': {
        isLoading: true,
      },
    })
  })

  it('HOME_EXECUTION_MODAL_ACTION_SUCCESS', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTION_MODAL_ACTION_SUCCESS, payload: 'modal' }

    expect(reducer(initialState, action)).toEqual({
      'modal': {
        isOpen: false,
        isLoading: false,
      },
    })
  })

  it('HOME_EXECUTION_MODAL_ACTION_FAILURE', () => {
    const initialState = {}
    const action = { type: HOME_EXECUTION_MODAL_ACTION_FAILURE, payload: 'modal' }

    expect(reducer(initialState, action)).toEqual({
      'modal': {
        isLoading: false,
      },
    })
  })
})
