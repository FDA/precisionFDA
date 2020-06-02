import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_APPS_FETCH_START,
  SPACE_APPS_FETCH_SUCCESS,
  SPACE_APPS_FETCH_FAILURE,
  SPACE_APPS_TABLE_SORT,
  SPACE_APPS_RESET_FILTERS,
  SPACE_APPS_TOGGLE_CHECKBOX,
  SPACE_APPS_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_SHOW_COPY_MODAL,
  SPACE_APPS_HIDE_COPY_MODAL,
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
} from '../../../actions/spaces/types'
import { isCheckedAllCheckboxes } from '../../../helpers'


export default createReducer(initialState, {
  [SPACE_APPS_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_APPS_FETCH_SUCCESS]: (state, { apps, links }) => ({
    ...state,
    entries: [...apps],
    isFetching: false,
    links,
  }),

  [SPACE_APPS_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_APPS_TABLE_SORT]: (state, { type, direction }) => ({
    ...state,
    sortType: type,
    sortDirection: direction,
  }),

  [SPACE_APPS_RESET_FILTERS]: (state) => ({
    ...state,
    sortType: null,
    sortDirection: null,
    isCheckedAll: false,
  }),

  [SPACE_APPS_TOGGLE_CHECKBOX]: (state, id) => {
    const entries = state.entries.map((app) => {
      if (app.id === id) app.isChecked = !app.isChecked
      return app
    })
    const isCheckedAll = isCheckedAllCheckboxes(entries)
    return {
      ...state,
      isCheckedAll,
      entries,
    }
  },

  [SPACE_APPS_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.entries)
    return {
      ...state,
      entries: state.entries.map((app) => {
        app.isChecked = !isCheckedAll
        return app
      }),
      isCheckedAll: !isCheckedAll,
    }
  },

  [SPACE_APPS_SHOW_COPY_MODAL]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: true,
    },
  }),

  [SPACE_APPS_HIDE_COPY_MODAL]: (state) => ({
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
