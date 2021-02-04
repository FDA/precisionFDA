import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
  HOME_APPS_FETCH_APP_DETAILS_START,
  HOME_APPS_FETCH_APP_DETAILS_SUCCESS,
  HOME_APPS_FETCH_APP_DETAILS_FAILURE,
  HOME_APPS_RESET_MODALS,
  HOME_APPS_SHOW_MODAL,
  HOME_APPS_HIDE_MODAL,
  HOME_COPY_APP_TO_SPACE_START,
  HOME_COPY_APP_TO_SPACE_SUCCESS,
  HOME_COPY_APP_TO_SPACE_FAILURE,
  HOME_ASSIGN_TO_CHALLENGE_START,
  HOME_ASSIGN_TO_CHALLENGE_SUCCESS,
  HOME_ASSIGN_TO_CHALLENGE_FAILURE,
  HOME_EDIT_APP_TAGS_START,
  HOME_EDIT_APP_TAGS_SUCCESS,
  HOME_EDIT_APP_TAGS_FAILURE,
  HOME_APPS_ATTACH_TO_START,
  HOME_APPS_ATTACH_TO_SUCCESS,
  HOME_APPS_ATTACH_TO_FAILURE,
  HOME_APPS_COMPARISON_ACTION_START,
  HOME_APPS_COMPARISON_ACTION_SUCCESS,
  HOME_APPS_COMPARISON_ACTION_FAILURE,
  HOME_APPS_SET_FILTER_VALUE,
  HOME_APPS_RESET_FILTERS,
  HOME_DELETE_APP_START,
  HOME_DELETE_APP_SUCCESS,
  HOME_DELETE_APP_FAILURE,
  HOME_APPS_MAKE_FEATURED_SUCCESS,
  HOME_APPS_FETCH_APP_EXECUTIONS_START,
  HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS,
  HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE,
} from '../../../actions/home/types'
import { isCheckedAllCheckboxes } from '../../../helpers'
import { HOME_APP_TYPES } from '../../../constants'


export default createReducer(initialState, {
  [HOME_APPS_FETCH_START]: (state, appsType) => ({
    ...state,
    [appsType]: {
      ...state[appsType],
      isFetching: true,
    },
  }),

  [HOME_APPS_FETCH_SUCCESS]: (state, { appsType, apps, pagination }) => ({
    ...state,
    [appsType]: {
      ...state[appsType],
      isFetching: false,
      isCheckedAll: false,
      apps: [...apps],
      filters: {
        ...state[appsType].filters,
        ...pagination,
      },
    },
  }),

  [HOME_APPS_FETCH_FAILURE]: (state, appsType) => ({
    ...state,
    [appsType]: {
      ...state[appsType],
      isFetching: false,
    },
  }),

  [HOME_APPS_TOGGLE_ALL_CHECKBOXES]: (state, appsType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[appsType].apps)
    return {
      ...state,
      [appsType]: {
        ...state[appsType],
        apps: state[appsType].apps.map((app) => {
          app.isChecked = !isCheckedAll
          return app
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_APPS_TOGGLE_CHECKBOX]: (state, { appsType, id }) => {
    const apps = state[appsType].apps.map((app) => {
      if (app.id === id) app.isChecked = !app.isChecked
      return app
    })
    const isCheckedAll = isCheckedAllCheckboxes(apps)
    return {
      ...state,
      [appsType]: {
        ...state[appsType],
        isCheckedAll,
        apps,
      },
    }
  },

  [HOME_APPS_FETCH_APP_DETAILS_START]: (state) => ({
    ...state,
    appDetails: {
      ...state.appDetails,
      isFetching: true,
      app: {},
      meta: {},
    },
  }),

  [HOME_APPS_FETCH_APP_DETAILS_SUCCESS]: (state, { app, meta }) => ({
    ...state,
    appDetails: {
      ...state.appDetails,
      isFetching: false,
      app,
      meta,
    },
  }),

  [HOME_APPS_FETCH_APP_DETAILS_FAILURE]: (state) => ({
    ...state,
    appDetails: {
      ...state.appDetails,
      isFetching: false,
    },
  }),

  [HOME_APPS_FETCH_APP_EXECUTIONS_START]: (state) => ({
    ...state,
    appExecutions: {
      ...state.appExecutions,
      isFetching: true,
      jobs: [],
      pagination: {},
    },
  }),

  [HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS]: (state, { jobs, pagination }) => ({
    ...state,
    appExecutions: {
      ...state.appExecutions,
      isFetching: false,
      jobs,
      filters: {
        ...state.appExecutions.filters,
        ...pagination,
      },
    },
  }),

  [HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE]: (state) => ({
    ...state,
    appExecutions: {
      ...state.appExecutions,
      isFetching: false,
    },
  }),

  [HOME_APPS_RESET_MODALS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_APPS_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_APPS_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_COPY_APP_TO_SPACE_START]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: true,
    },
  }),

  [HOME_COPY_APP_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_COPY_APP_TO_SPACE_FAILURE]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: false,
    },
  }),

  [HOME_ASSIGN_TO_CHALLENGE_START]: (state) => ({
    ...state,
    assignToChallengeModal: {
      ...state.assignToChallengeModal,
      isLoading: true,
    },
  }),

  [HOME_ASSIGN_TO_CHALLENGE_SUCCESS]: (state) => ({
    ...state,
    assignToChallengeModal: {
      ...state.assignToChallengeModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_ASSIGN_TO_CHALLENGE_FAILURE]: (state) => ({
    ...state,
    assignToChallengeModal: {
      ...state.assignToChallengeModal,
      isLoading: false,
    },
  }),

  [HOME_EDIT_APP_TAGS_START]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: true,
    },
  }),

  [HOME_EDIT_APP_TAGS_SUCCESS]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_EDIT_APP_TAGS_FAILURE]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: false,
    },
  }),

  [HOME_APPS_ATTACH_TO_START]: (state) => ({
    ...state,
    appsAttachToModal: {
      ...state.appsAttachToModal,
      isLoading: true,
    },
  }),

  [HOME_APPS_ATTACH_TO_SUCCESS]: (state) => ({
    ...state,
    appsAttachToModal: {
      ...state.appsAttachToModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_APPS_ATTACH_TO_FAILURE]: (state) => ({
    ...state,
    appsAttachToModal: {
      ...state.appsAttachToModal,
      isLoading: false,
    },
  }),

  [HOME_APPS_SET_FILTER_VALUE]: (state, { appsType, value }) => ({
    ...state,
    [appsType]: {
      ...state[appsType],
      filters: {
        ...state[appsType].filters,
        ...value,
      },
    },
  }),

  [HOME_APPS_RESET_FILTERS]: (state, { appsType }) => ({
    ...state,
    [appsType]: {
      ...state[appsType],
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

  [HOME_APPS_COMPARISON_ACTION_START]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isLoading: true,
    },
  }),

  [HOME_APPS_COMPARISON_ACTION_SUCCESS]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_APPS_COMPARISON_ACTION_FAILURE]: (state) => ({
    ...state,
    comparisonModal: {
      ...state.comparisonModal,
      isLoading: false,
    },
  }),

  [HOME_DELETE_APP_START]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: true,
    },
  }),

  [HOME_DELETE_APP_SUCCESS]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DELETE_APP_FAILURE]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: false,
    },
  }),

  [HOME_APPS_MAKE_FEATURED_SUCCESS]: (state, items) => {
    const apps = state[HOME_APP_TYPES.EVERYBODY].apps.map((app) => {
      const elem = items.find(e => e.id === app.id)
      if (elem) app = elem
      return app
    })

    const isCheckedAll = isCheckedAllCheckboxes(apps)

    return {
      ...state,
      [HOME_APP_TYPES.EVERYBODY]: {
        ...state[HOME_APP_TYPES.EVERYBODY],
        apps,
        isCheckedAll,
      },
    }
  },
})
