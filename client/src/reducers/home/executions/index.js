import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_EXECUTIONS_FETCH_START,
  HOME_EXECUTIONS_FETCH_SUCCESS,
  HOME_EXECUTIONS_FETCH_FAILURE,
  HOME_EXECUTIONS_EXPAND_EXECUTION,
  HOME_EXECUTIONS_EXPAND_ALL_EXECUTION,
  HOME_EXECUTIONS_TOGGLE_CHECKBOX,
  HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_FAILURE,
  HOME_EXECUTIONS_SET_FILTER_VALUE,
  HOME_EXECUTIONS_RESET_FILTERS,
  HOME_EXECUTIONS_SHOW_MODAL,
  HOME_EXECUTIONS_HIDE_MODAL,
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
  HOME_EXECUTIONS_MAKE_FEATURED_SUCCESS,
} from '../../../actions/home/executions/types'
import { isCheckedAllCheckboxes, isExpandedAllItems } from '../../../helpers'
import { HOME_ENTRIES_TYPES } from '../../../constants'


const makeFeaturedExecutions = (executions, featuredItems) => {
  return executions.map((job) => {
    if (job.isWorkflow) job.executions = makeFeaturedExecutions(job.executions, featuredItems)

    const elem = featuredItems.find(e => e.id === job.id)
    if (elem) job = elem
    return job
  })
}

export default createReducer(initialState, {
  [HOME_EXECUTIONS_FETCH_START]: (state, executionsType) => ({
    ...state,
    [executionsType]: {
      ...state[executionsType],
      isFetching: true,
    },
  }),

  [HOME_EXECUTIONS_FETCH_SUCCESS]: (state, { executionsType, executions, pagination }) => ({
    ...state,
    [executionsType]: {
      ...state[executionsType],
      isFetching: false,
      isCheckedAll: false,
      executions,
      filters: {
        ...state[executionsType].filters,
        ...pagination,
      },
    },
  }),

  [HOME_EXECUTIONS_FETCH_FAILURE]: (state, executionsType) => ({
    ...state,
    [executionsType]: {
      ...state[executionsType],
      isFetching: false,
    },
  }),

  [HOME_EXECUTIONS_EXPAND_EXECUTION]: (state, { executionsType, key }) => {
    const executions = state[executionsType].executions.map((exec) => {
      if (exec.key === key) exec.isExpanded = !exec.isExpanded
      return exec
    })

    const isExpandedAll = isExpandedAllItems(executions)

    return {
      ...state,
      [executionsType]: {
        ...state[executionsType],
        isExpandedAll,
        executions,
      },
    }
  },

  [HOME_EXECUTIONS_EXPAND_ALL_EXECUTION]: (state, executionsType) => {
    const isExpandedAll = isExpandedAllItems(state[executionsType].executions)
    return {
      ...state,
      [executionsType]: {
        ...state[executionsType],
        executions: state[executionsType].executions.map((execution) => {
          execution.isExpanded = !isExpandedAll
          return execution
        }),
        isExpandedAll: !isExpandedAll,
      },
    }
  },

  [HOME_EXECUTIONS_TOGGLE_CHECKBOX]: (state, { executionsType, key }) => {
    const executions = state[executionsType].executions.map((exec) => {
      if (exec.key === key) exec.isChecked = !exec.isChecked
      return exec
    })

    const isCheckedAll = isCheckedAllCheckboxes(executions)

    return {
      ...state,
      [executionsType]: {
        ...state[executionsType],
        isCheckedAll,
        executions,
      },
    }
  },

  [HOME_EXECUTIONS_TOGGLE_ALL_CHECKBOXES]: (state, executionsType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[executionsType].executions)
    return {
      ...state,
      [executionsType]: {
        ...state[executionsType],
        executions: state[executionsType].executions.map((execution) => {
          execution.isChecked = !isCheckedAll
          return execution
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START]: (state) => ({
    ...state,
    executionDetails: {
      ...state.executionDetails,
      isFetching: true,
      execution: {},
      meta: {},
    },
  }),

  [HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS]: (state, { execution, meta }) => ({
    ...state,
    executionDetails: {
      ...state.executionDetails,
      isFetching: false,
      execution,
      meta,
    },
  }),

  [HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_FAILURE]: (state) => ({
    ...state,
    executionDetails: {
      ...state.executionDetails,
      isFetching: false,
    },
  }),

  [HOME_EXECUTIONS_SET_FILTER_VALUE]: (state, { executionsType, value }) => ({
    ...state,
    [executionsType]: {
      ...state[executionsType],
      filters: {
        ...state[executionsType].filters,
        ...value,
      },
    },
  }),

  [HOME_EXECUTIONS_RESET_FILTERS]: (state, { executionsType }) => ({
    ...state,
    [executionsType]: {
      ...state[executionsType],
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
  }),

  [HOME_EXECUTIONS_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_EXECUTIONS_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_EXECUTION_MODAL_ACTION_START]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: true,
    },
  }),

  [HOME_EXECUTION_MODAL_ACTION_SUCCESS]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_EXECUTION_MODAL_ACTION_FAILURE]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: false,
    },
  }),

  [HOME_EXECUTIONS_MAKE_FEATURED_SUCCESS]: (state, items) => {
    const executions = makeFeaturedExecutions(state[HOME_ENTRIES_TYPES.EVERYBODY].executions, items)

    const isCheckedAll = isCheckedAllCheckboxes(executions)

    return {
      ...state,
      [HOME_ENTRIES_TYPES.EVERYBODY]: {
        ...state[HOME_ENTRIES_TYPES.EVERYBODY],
        executions,
        isCheckedAll,
      },
    }
  },
})
