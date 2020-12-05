import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
  HOME_APPS_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_TOGGLE_CHECKBOX,
  HOME_APPS_FEATURED_FETCH_START,
  HOME_APPS_FEATURED_FETCH_SUCCESS,
  HOME_APPS_FEATURED_FETCH_FAILURE,
  HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES,
  HOME_APPS_FEATURED_TOGGLE_CHECKBOX,
} from '../../../actions/home/types'
import { isCheckedAllCheckboxes } from '../../../helpers'


export default createReducer(initialState, {
  [HOME_APPS_FETCH_START]: state => ({
    ...state,
    privateApps: {
      ...state.privateApps,
      isFetching: true,
    },
  }),

  [HOME_APPS_FETCH_SUCCESS]: (state, apps) => ({
    ...state,
    privateApps: {
      ...state.privateApps,
      isFetching: false,
      isCheckedAll: false,
      apps: [...apps],
    },
  }),

  [HOME_APPS_FETCH_FAILURE]: state => ({
    ...state,
    privateApps: {
      ...state.privateApps,
      isFetching: false,
    },
  }),

  [HOME_APPS_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.privateApps.apps)
    return {
      ...state,
      privateApps: {
        apps: state.privateApps.apps.map((app) => {
          app.isChecked = !isCheckedAll
          return app
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_APPS_TOGGLE_CHECKBOX]: (state, id) => {
    const apps = state.privateApps.apps.map((app) => {
      if (app.id === id) app.isChecked = !app.isChecked
      return app
    })
    const isCheckedAll = isCheckedAllCheckboxes(apps)
    return {
      ...state,
      privateApps: {
        isCheckedAll,
        apps,
      },
    }
  },


  [HOME_APPS_FEATURED_FETCH_START]: state => ({
    ...state,
    featuredApps: {
      ...state.featuredApps,
      isFetching: true,
    },
  }),

  [HOME_APPS_FEATURED_FETCH_SUCCESS]: (state, apps) => ({
    ...state,
    featuredApps: {
      ...state.featuredApps,
      isFetching: false,
      isCheckedAll: false,
      apps: [...apps],
    },
  }),

  [HOME_APPS_FEATURED_FETCH_FAILURE]: state => ({
    ...state,
    featuredApps: {
      ...state.featuredApps,
      isFetching: false,
    },
  }),

  [HOME_APPS_FEATURED_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.featuredApps.apps)
    return {
      ...state,
      featuredApps: {
        apps: state.featuredApps.apps.map((app) => {
          app.isChecked = !isCheckedAll
          return app
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_APPS_FEATURED_TOGGLE_CHECKBOX]: (state, id) => {
    const apps = state.featuredApps.apps.map((app) => {
      if (app.id === id) app.isChecked = !app.isChecked
      return app
    })
    const isCheckedAll = isCheckedAllCheckboxes(apps)
    return {
      ...state,
      featuredApps: {
        isCheckedAll,
        apps,
      },
    }
  },
})