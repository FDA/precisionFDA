import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_WORKFLOWS_FETCH_START,
  SPACE_WORKFLOWS_FETCH_SUCCESS,
  SPACE_WORKFLOWS_FETCH_FAILURE,
  SPACE_WORKFLOWS_TABLE_SORT,
  SPACE_WORKFLOWS_RESET_FILTERS,
  SPACE_WORKFLOWS_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_SHOW_COPY_MODAL,
  SPACE_WORKFLOWS_HIDE_COPY_MODAL,
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
} from '../../../actions/spaces/types'
import { isCheckedAllCheckboxes } from '../../../helpers'


export default createReducer(initialState, {
  [SPACE_WORKFLOWS_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_WORKFLOWS_FETCH_SUCCESS]: (state, { workflows, links }) => ({
    ...state,
    entries: [...workflows],
    isFetching: false,
    links,
  }),

  [SPACE_WORKFLOWS_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_WORKFLOWS_TABLE_SORT]: (state, { type, direction }) => ({
    ...state,
    sortType: type,
    sortDirection: direction,
  }),

  [SPACE_WORKFLOWS_RESET_FILTERS]: (state) => ({
    ...state,
    sortType: null,
    sortDirection: null,
  }),

  [SPACE_WORKFLOWS_TOGGLE_CHECKBOX]: (state, id) => {
    const entries = state.entries.map((workflow) => {
      if (workflow.id === id) workflow.isChecked = !workflow.isChecked
      return workflow
    })
    const isCheckedAll = isCheckedAllCheckboxes(entries)
    return {
      ...state,
      isCheckedAll,
      entries,
    }
  },

  [SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.entries)
    return {
      ...state,
      entries: state.entries.map((workflow) => {
        workflow.isChecked = !isCheckedAll
        return workflow
      }),
      isCheckedAll: !isCheckedAll,
    }
  },

  [SPACE_WORKFLOWS_SHOW_COPY_MODAL]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: true,
    },
  }),

  [SPACE_WORKFLOWS_HIDE_COPY_MODAL]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: false,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_START]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: true,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_SUCCESS]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_FAILURE]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_START]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: true,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_FAILURE]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
    },
  }),
})
