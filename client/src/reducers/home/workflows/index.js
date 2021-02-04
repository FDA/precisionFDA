import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_WORKFLOWS_FETCH_START,
  HOME_WORKFLOWS_FETCH_SUCCESS,
  HOME_WORKFLOWS_FETCH_FAILURE,
  HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  HOME_WORKFLOWS_TOGGLE_CHECKBOX,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE,
  HOME_WORKFLOWS_RESET_MODALS,
  HOME_WORKFLOWS_SHOW_MODAL,
  HOME_WORKFLOWS_HIDE_MODAL,
  HOME_COPY_WORKFLOW_TO_SPACE_START,
  HOME_COPY_WORKFLOW_TO_SPACE_SUCCESS,
  HOME_COPY_WORKFLOW_TO_SPACE_FAILURE,
  HOME_WORKFLOWS_ATTACH_TO_START,
  HOME_WORKFLOWS_ATTACH_TO_SUCCESS,
  HOME_WORKFLOWS_ATTACH_TO_FAILURE,
  HOME_WORKFLOWS_COMPARISON_ACTION_START,
  HOME_WORKFLOWS_COMPARISON_ACTION_SUCCESS,
  HOME_WORKFLOWS_COMPARISON_ACTION_FAILURE,
  HOME_WORKFLOWS_SET_FILTER_VALUE,
  HOME_WORKFLOWS_RESET_FILTERS,
  HOME_DELETE_WORKFLOW_START,
  HOME_DELETE_WORKFLOW_SUCCESS,
  HOME_DELETE_WORKFLOW_FAILURE,
  HOME_WORKFLOWS_MAKE_FEATURED_SUCCESS,
  HOME_EDIT_WORKFLOW_TAGS_START,
  HOME_EDIT_WORKFLOW_TAGS_SUCCESS,
  HOME_EDIT_WORKFLOW_TAGS_FAILURE,
} from '../../../actions/home/workflows/types'
import { isCheckedAllCheckboxes } from '../../../helpers'
import { HOME_WORKFLOW_TYPES } from '../../../constants'


export default createReducer(initialState, {
  [HOME_WORKFLOWS_FETCH_START]: (state, workflowsType) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
      isFetching: true,
    },
  }),

  [HOME_WORKFLOWS_FETCH_SUCCESS]: (state, { workflowsType, workflows, pagination }) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
      isFetching: false,
      isCheckedAll: false,
      workflows: [...workflows],
      filters: {
        ...state[workflowsType].filters,
        ...pagination,
      },
    },
  }),

  [HOME_WORKFLOWS_FETCH_FAILURE]: (state, workflowsType) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
      isFetching: false,
    },
  }),

  [HOME_WORKFLOWS_TOGGLE_ALL_CHECKBOXES]: (state, workflowsType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[workflowsType].workflows)
    return {
      ...state,
      [workflowsType]: {
        ...state[workflowsType],
        workflows: state[workflowsType].workflows.map((workflow) => {
          workflow.isChecked = !isCheckedAll
          return workflow
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_WORKFLOWS_TOGGLE_CHECKBOX]: (state, { workflowsType, id }) => {
    const workflows = state[workflowsType].workflows.map((workflow) => {
      if (workflow.id === id) workflow.isChecked = !workflow.isChecked
      return workflow
    })
    const isCheckedAll = isCheckedAllCheckboxes(workflows)
    return {
      ...state,
      [workflowsType]: {
        ...state[workflowsType],
        isCheckedAll,
        workflows,
      },
    }
  },

  [HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START]: (state) => ({
    ...state,
    workflowDetails: {
      ...state.workflowDetails,
      isFetching: true,
      workflow: {},
      meta: {},
    },
  }),

  [HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS]: (state, { workflow, meta }) => ({
    ...state,
    workflowDetails: {
      ...state.workflowDetails,
      isFetching: false,
      workflow,
      meta,
    },
  }),

  [HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE]: (state) => ({
    ...state,
    workflowDetails: {
      ...state.workflowDetails,
      isFetching: false,
    },
  }),

  [HOME_WORKFLOWS_RESET_MODALS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_WORKFLOWS_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_WORKFLOWS_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_COPY_WORKFLOW_TO_SPACE_START]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: true,
    },
  }),

  [HOME_COPY_WORKFLOW_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_COPY_WORKFLOW_TO_SPACE_FAILURE]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [HOME_WORKFLOWS_SET_FILTER_VALUE]: (state, { workflowsType, value }) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
      filters: {
        ...state[workflowsType].filters,
        ...value,
      },
    },
  }),

  [HOME_WORKFLOWS_ATTACH_TO_START]: (state) => ({
    ...state,
    workflowsAttachToModal: {
      ...state.workflowsAttachToModal,
      isLoading: true,
    },
  }),


  [HOME_WORKFLOWS_ATTACH_TO_SUCCESS]: (state) => ({
    ...state,
    attachToModal: {
      ...state.attachToModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_WORKFLOWS_ATTACH_TO_FAILURE]: (state) => ({
    ...state,
    attachToModal: {
      ...state.attachToModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [HOME_WORKFLOWS_SET_FILTER_VALUE]: (state, { workflowsType, value }) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
      filters: {
        ...state[workflowsType].filters,
        ...value,
      },
    },
  }),
  [HOME_WORKFLOWS_RESET_FILTERS]: (state, { workflowsType }) => ({
    ...state,
    [workflowsType]: {
      ...state[workflowsType],
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

  [HOME_WORKFLOWS_COMPARISON_ACTION_START]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isLoading: true,
    },
  }),

  [HOME_WORKFLOWS_COMPARISON_ACTION_SUCCESS]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_WORKFLOWS_COMPARISON_ACTION_FAILURE]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isLoading: false,
    },
  }),

  [HOME_DELETE_WORKFLOW_START]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: true,
    },
  }),

  [HOME_DELETE_WORKFLOW_SUCCESS]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DELETE_WORKFLOW_FAILURE]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [HOME_WORKFLOWS_MAKE_FEATURED_SUCCESS]: (state, items) => {
    const workflows = state[HOME_WORKFLOW_TYPES.EVERYONE].workflows.map((workflow) => {
      const elem = items.find(e => e.id === workflow.id)
      if (elem) workflow = elem
      return workflow
    })

    const isCheckedAll = isCheckedAllCheckboxes(workflows)

    return {
      ...state,
      [HOME_WORKFLOW_TYPES.EVERYONE]: {
        ...state[HOME_WORKFLOW_TYPES.EVERYONE],
        workflows,
        isCheckedAll,
      },
    }
  },
  [HOME_EDIT_WORKFLOW_TAGS_START]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: true,
    },
  }),

  [HOME_EDIT_WORKFLOW_TAGS_SUCCESS]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_EDIT_WORKFLOW_TAGS_FAILURE]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: false,
    },
  }),

})
