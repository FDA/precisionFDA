import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_ASSETS_FETCH_START,
  HOME_ASSETS_FETCH_SUCCESS,
  HOME_ASSETS_FETCH_FAILURE,
  HOME_ASSETS_TOGGLE_ALL_CHECKBOXES,
  HOME_ASSETS_TOGGLE_CHECKBOX,
  HOME_ASSETS_SET_FILTER_VALUE,
  HOME_ASSETS_RESET_FILTERS,
  HOME_ASSETS_FETCH_ASSET_DETAILS_START,
  HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS,
  HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE,
  HOME_ASSETS_SHOW_MODAL,
  HOME_ASSETS_HIDE_MODAL,
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
  HOME_ASSETS_MAKE_FEATURED_SUCCESS,
} from '../../../actions/home/assets/types'
import { HOME_ENTRIES_TYPES } from '../../../constants'
import { isCheckedAllCheckboxes } from '../../../helpers'


export default createReducer(initialState, {
  [HOME_ASSETS_FETCH_START]: (state, assetsType) => ({
    ...state,
    [assetsType]: {
      ...state[assetsType],
      isFetching: true,
    },
  }),

  [HOME_ASSETS_FETCH_SUCCESS]: (state, { assetsType, assets, pagination }) => ({
    ...state,
    [assetsType]: {
      ...state[assetsType],
      isFetching: false,
      isCheckedAll: false,
      assets: [...assets],
      filters: {
        ...state[assetsType].filters,
        ...pagination,
      },
    },
  }),

  [HOME_ASSETS_FETCH_FAILURE]: (state, assetsType) => ({
    ...state,
    [assetsType]: {
      ...state[assetsType],
      isFetching: false,
    },
  }),

  [HOME_ASSETS_TOGGLE_ALL_CHECKBOXES]: (state, assetsType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[assetsType].assets)
    return {
      ...state,
      [assetsType]: {
        ...state[assetsType],
        assets: state[assetsType].assets.map((asset) => {
          asset.isChecked = !isCheckedAll
          return asset
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_ASSETS_TOGGLE_CHECKBOX]: (state, { assetsType, id }) => {
    const assets = state[assetsType].assets.map((asset) => {
      if (asset.id === id) asset.isChecked = !asset.isChecked
      return asset
    })
    const isCheckedAll = isCheckedAllCheckboxes(assets)
    return {
      ...state,
      [assetsType]: {
        ...state[assetsType],
        isCheckedAll,
        assets,
      },
    }
  },

  [HOME_ASSETS_SET_FILTER_VALUE]: (state, { assetsType, value }) => ({
    ...state,
    [assetsType]: {
      ...state[assetsType],
      filters: {
        ...state[assetsType].filters,
        ...value,
      },
    },
  }),

  [HOME_ASSETS_RESET_FILTERS]: (state, { assetsType }) => ({
    ...state,
    [assetsType]: {
      ...state[assetsType],
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

  [HOME_ASSETS_FETCH_ASSET_DETAILS_START]: (state) => ({
    ...state,
    assetDetails: {
      ...state.assetDetails,
      isFetching: true,
    },
  }),

  [HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS]: (state, { asset, meta }) => ({
    ...state,
    assetDetails: {
      ...state.assetDetails,
      isFetching: false,
      asset,
      meta,
    },
  }),

  [HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE]: (state) => ({
    ...state,
    assetDetails: {
      ...state.assetDetails,
      isFetching: false,
    },
  }),

  [HOME_ASSETS_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_ASSETS_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_ASSETS_MODAL_ACTION_START]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: true,
    },
  }),

  [HOME_ASSETS_MODAL_ACTION_SUCCESS]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_ASSETS_MODAL_ACTION_FAILURE]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: false,
    },
  }),

  [HOME_ASSETS_MAKE_FEATURED_SUCCESS]: (state, items) => {
    const assets = state[HOME_ENTRIES_TYPES.EVERYBODY].assets.map((asset) => {
      const elem = items.find(e => e.id === asset.id)
      if (elem) asset = elem
      return asset
    })

    const isCheckedAll = isCheckedAllCheckboxes(assets)

    return {
      ...state,
      [HOME_ENTRIES_TYPES.EVERYBODY]: {
        ...state[HOME_ENTRIES_TYPES.EVERYBODY],
        assets,
        isCheckedAll,
      },
    }
  },
})
