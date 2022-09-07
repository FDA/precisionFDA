import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_DATABASES_FETCH_START,
  HOME_DATABASES_FETCH_SUCCESS,
  HOME_DATABASES_FETCH_FAILURE,
  HOME_DATABASES_TOGGLE_ALL_CHECKBOXES,
  HOME_DATABASES_TOGGLE_CHECKBOX,
  HOME_DATABASES_FETCH_DETAILS_START,
  HOME_DATABASES_FETCH_DETAILS_SUCCESS,
  HOME_DATABASES_FETCH_DETAILS_FAILURE,
  HOME_DATABASES_RESET_MODALS,
  HOME_DATABASES_SHOW_MODAL,
  HOME_DATABASES_HIDE_MODAL,
  HOME_DATABASES_SET_FILTER_VALUE,
  HOME_DATABASES_RESET_FILTERS,
  HOME_DATABASES_EDIT_TAGS_START,
  HOME_DATABASES_EDIT_TAGS_SUCCESS,
  HOME_DATABASES_EDIT_TAGS_FAILURE,
  HOME_DATABASE_EDIT_INFO_START,
  HOME_DATABASE_EDIT_INFO_SUCCESS,
  HOME_DATABASE_EDIT_INFO_FAILURE,
  HOME_DATABASES_RUN_ACTION_START,
  HOME_DATABASES_RUN_ACTION_SUCCESS,
  HOME_DATABASES_RUN_ACTION_FAILURE,
} from '../../../actions/home/databases/types'
import { isCheckedAllCheckboxes } from '../../../helpers'


export default createReducer(initialState, {
  [HOME_DATABASES_FETCH_START]: (state, databasesType) => ({
    ...state,
    [databasesType]: {
      ...state[databasesType],
      isFetching: true,
    },
  }),

  [HOME_DATABASES_FETCH_SUCCESS]: (state, { databasesType, databases, pagination }) => ({
    ...state,
    [databasesType]: {
      ...state[databasesType],
      isFetching: false,
      isCheckedAll: false,
      databases: [...databases],
      filters: {
        ...state[databasesType].filters,
        ...pagination,
      },
    },
  }),

  [HOME_DATABASES_FETCH_FAILURE]: (state, databasesType) => ({
    ...state,
    [databasesType]: {
      ...state[databasesType],
      isFetching: false,
    },
  }),

  [HOME_DATABASES_TOGGLE_ALL_CHECKBOXES]: (state, databasesType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[databasesType].databases)
    return {
      ...state,
      [databasesType]: {
        ...state[databasesType],
        databases: state[databasesType].databases.map((database) => {
          database.isChecked = !isCheckedAll
          return database
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_DATABASES_TOGGLE_CHECKBOX]: (state, { databasesType, id }) => {
    const databases = state[databasesType].databases.map((database) => {
      if (database.id === id) database.isChecked = !database.isChecked
      return database
    })
    const isCheckedAll = isCheckedAllCheckboxes(databases)
    return {
      ...state,
      [databasesType]: {
        ...state[databasesType],
        isCheckedAll,
        databases,
      },
    }
  },

  [HOME_DATABASES_FETCH_DETAILS_START]: (state) => ({
    ...state,
    databaseDetails: {
      ...state.databaseDetails,
      isFetching: true,
      database: {},
      meta: {},
    },
  }),

  [HOME_DATABASES_FETCH_DETAILS_SUCCESS]: (state, { database, meta }) => ({
    ...state,
    databaseDetails: {
      ...state.databaseDetails,
      isFetching: false,
      database,
      meta,
    },
  }),

  [HOME_DATABASES_FETCH_DETAILS_FAILURE]: (state) => ({
    ...state,
    databaseDetails: {
      ...state.databaseDetails,
      isFetching: false,
    },
  }),

   [HOME_DATABASES_RESET_MODALS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DATABASES_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_DATABASES_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_DATABASES_EDIT_TAGS_START]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: true,
    },
  }),

  [HOME_DATABASES_EDIT_TAGS_SUCCESS]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DATABASES_EDIT_TAGS_FAILURE]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: false,
    },
  }),

  [HOME_DATABASE_EDIT_INFO_START]: (state) => ({
    ...state,
    editDatabaseInfoModal: {
      ...state.editDatabaseInfoModal,
      isLoading: true,
    },
  }),

  [HOME_DATABASE_EDIT_INFO_SUCCESS]: (state) => ({
    ...state,
    editDatabaseInfoModal: {
      ...state.editDatabaseInfoModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DATABASE_EDIT_INFO_FAILURE]: (state) => ({
    ...state,
    editDatabaseInfoModal: {
      ...state.editDatabaseInfoModal,
      isLoading: false,
    },
  }),

  [HOME_DATABASES_RUN_ACTION_START]: (state) => ({
    ...state,
    runActionModal: {
      ...state.runActionModal,
      isLoading: true,
    },
  }),

  [HOME_DATABASES_RUN_ACTION_SUCCESS]: (state) => ({
    ...state,
    runActionModal: {
      ...state.runActionModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DATABASES_RUN_ACTION_FAILURE]: (state) => ({
    ...state,
    runActionModal: {
      ...state.runActionModal,
      isLoading: false,
    },
  }),

  [HOME_DATABASES_SET_FILTER_VALUE]: (state, { databasesType, value }) => ({
    ...state,
    [databasesType]: {
      ...state[databasesType],
      filters: {
        ...state[databasesType].filters,
        ...value,
      },
    },
  }),

  [HOME_DATABASES_RESET_FILTERS]: (state, { databasesType }) => ({
    ...state,
    [databasesType]: {
      ...state[databasesType],
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
})
