import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeApp } from '../../../../views/shapes/HomeAppShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
} from '../../types'
import { setPageCounters } from '../../index'
import { homeAppsFiltersSelector } from '../../../../reducers/home/apps/selectors'
import { HOME_APP_TYPES, HOME_TABS } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAppsStart = () => createAction(HOME_APPS_FETCH_START, HOME_APP_TYPES.PRIVATE)

const fetchAppsSuccess = (apps, pagination) => createAction(HOME_APPS_FETCH_SUCCESS, { appsType: HOME_APP_TYPES.PRIVATE, apps, pagination })

const fetchAppsFailure = () => createAction(HOME_APPS_FETCH_FAILURE, HOME_APP_TYPES.PRIVATE)

export default () => (
  async (dispatch, getState) => {
    const filters = homeAppsFiltersSelector(getState())
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

    dispatch(fetchAppsStart())

    try {
      const response = await API.getApps(params)

      if (response.status === httpStatusCodes.OK) {
        const apps = response.payload.apps ? response.payload.apps.map(mapToHomeApp) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

        if (response.payload.meta) {
          const counters = {
            apps: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters, HOME_TABS.PRIVATE))
        }

        dispatch(fetchAppsSuccess(apps, pagination))
      } else {
        dispatch(fetchAppsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchAppsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
