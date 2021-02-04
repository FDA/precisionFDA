import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_SET_CURRENT_TAB,
  HOME_SET_CURRENT_PAGE,
  HOME_FETCH_ACCESSIBLE_SPACES_SUCCESS,
  HOME_FETCH_ACCESSIBLE_SPACES_START,
  HOME_FETCH_ACCESSIBLE_SPACES_FAILURE,
  HOME_SELECT_ACCESSIBLE_SPACE,
  HOME_SET_PAGE_COUNTERS,
  HOME_SET_INITIAL_PAGE_COUNTERS,
  HOME_SET_INITIAL_PAGE_ADMIN_STATUS,
  HOME_FETCH_ATTACHING_ITEMS_SUCCESS,
  HOME_FETCH_ATTACHING_ITEMS_START,
  HOME_FETCH_ATTACHING_ITEMS_FAILURE,
  HOME_SET_IS_LEFT_MENU_OPEN,
  HOME_FETCH_ACCESSIBLE_LICENSE_SUCCESS,
  HOME_FETCH_ACCESSIBLE_LICENSE_START,
  HOME_FETCH_ACCESSIBLE_LICENSE_FAILURE,
  HOME_SELECT_ACCESSIBLE_LICENSE,
} from '../../../actions/home/types'


export default createReducer(initialState, {
  [HOME_SET_CURRENT_TAB]: (state, tab) => ({
    ...state,
    currentTab: tab,
  }),

  [HOME_SET_CURRENT_PAGE]: (state, page) => ({
    ...state,
    currentPage: page,
    counters: {
      ...state.privateCounters,
    },
  }),

  [HOME_FETCH_ACCESSIBLE_SPACES_START]: (state) => ({
    ...state,
    isCopyToSpaceLoading: true,
  }),

  [HOME_FETCH_ACCESSIBLE_SPACES_SUCCESS]: (state, spaces) => ({
    ...state,
    accessibleSpaces: spaces,
    isCopyToSpaceLoading: false,
  }),

  [HOME_FETCH_ACCESSIBLE_SPACES_FAILURE]: (state) => ({
    ...state,
    isCopyToSpaceLoading: false,
  }),

  [HOME_SELECT_ACCESSIBLE_SPACE]: (state, scope) => {
    const spaces = state.accessibleSpaces.map((space) => {
      if (space.scope === scope) {
        space.isSelected = !space.isSelected
      } else {
        space.isSelected = false
      }
      return space
    })
    
    return {
      ...state,
      accessibleSpaces: spaces,
    }
  },

  [HOME_FETCH_ACCESSIBLE_LICENSE_START]: (state) => ({
    ...state,
    isLoading: true,
  }),

  [HOME_FETCH_ACCESSIBLE_LICENSE_SUCCESS]: (state, license) => ({
    ...state,
    accessibleLicense: license,
    isLoading: false,
  }),

  [HOME_FETCH_ACCESSIBLE_LICENSE_FAILURE]: (state) => ({
    ...state,
    isLoading: false,
  }),

  [HOME_SELECT_ACCESSIBLE_LICENSE]: (state, id) => {
    const license = state.accessibleLicense.map((license) => {
      if (license.id === id) {
        license.isSelected = !license.isSelected
      } else {
        license.isSelected = false
      }
      return license
    })
    
    return {
      ...state,
      accessibleLicense: license,
    }
  },

  [HOME_SET_PAGE_COUNTERS]: (state, counters) => ({
    ...state,
    counters: {
      ...state.counters,
      ...counters,
    },
  }),

  [HOME_SET_INITIAL_PAGE_COUNTERS]: (state, counters) => ({
    ...state,
    counters: {
      ...state.counters,
      ...counters,
    },
    privateCounters: {
      ...state.privateCounters,
      ...counters,
    },
  }),

  [HOME_SET_INITIAL_PAGE_ADMIN_STATUS]: (state, status) => ({
    ...state,
    adminStatus: status,
  }),

  [HOME_FETCH_ATTACHING_ITEMS_START]: (state) => ({
    ...state,
    attachingItems: {
      ...state.attachingItems,
      isLoading: true,
    },
  }),

  [HOME_FETCH_ATTACHING_ITEMS_SUCCESS]: (state, items) => ({
    ...state,
    attachingItems: {
      ...state.attachingItems,
      items,
      isLoading: false,
    },
  }),

  [HOME_FETCH_ATTACHING_ITEMS_FAILURE]: (state) => ({
    ...state,
    attachingItems: {
      ...state.attachingItems,
      isLoading: false,
    },
  }),

  [HOME_SET_IS_LEFT_MENU_OPEN]: (state, value) => ({
    ...state,
    isLeftMenuOpen: value,
  }),
})
