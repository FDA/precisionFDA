import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeAsset } from '../../../../views/shapes/HomeAssetShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_ASSETS_FETCH_START,
  HOME_ASSETS_FETCH_SUCCESS,
  HOME_ASSETS_FETCH_FAILURE,
} from '../types'
import { setPageCounters } from '../../index'
import { homeAssetsSpacesFiltersSelector } from '../../../../reducers/home/assets/selectors'
import { HOME_ENTRIES_TYPES } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAssetsStart = () => createAction(HOME_ASSETS_FETCH_START, HOME_ENTRIES_TYPES.SPACES)

const fetchAssetsSuccess = (assets, pagination) => createAction(HOME_ASSETS_FETCH_SUCCESS, { assetsType: HOME_ENTRIES_TYPES.SPACES, assets, pagination })

const fetchAssetsFailure = () => createAction(HOME_ASSETS_FETCH_FAILURE, HOME_ENTRIES_TYPES.SPACES)

export default () => (
  async (dispatch, getState) => {
    const filters = homeAssetsSpacesFiltersSelector(getState())
    const { sortType, sortDirection, currentPage, fields } = filters

    const params = { page: currentPage }
    if (sortType) {
      params.order_by = sortType
      params.order_dir = sortDirection
    }

    if (fields.size) {
      fields.forEach((val, key) => {
        if (val) params[`filters[${key}]`] = val
      })
    }

    dispatch(fetchAssetsStart())

    try {
      const response = await API.getAssetsSpaces(params)

      if (response.status === httpStatusCodes.OK) {
        const assets = response.payload.assets ? response.payload.assets.map(mapToHomeAsset) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

        if (response.payload.meta) {
          const counters = {
            assets: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters))
        }

        dispatch(fetchAssetsSuccess(assets, pagination))
      } else {
        dispatch(fetchAssetsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchAssetsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
