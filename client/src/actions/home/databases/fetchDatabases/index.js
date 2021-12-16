import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeDatabase } from '../../../../views/shapes/HomeDatabaseShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_DATABASES_FETCH_START,
  HOME_DATABASES_FETCH_SUCCESS,
  HOME_DATABASES_FETCH_FAILURE,
} from '../types'
import { setPageCounters } from '../../index'
import { homeDatabasesFiltersSelector } from '../../../../reducers/home/databases/selectors'
import { HOME_DATABASE_TYPES, HOME_TABS } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchDatabasesStart = () => createAction(HOME_DATABASES_FETCH_START, HOME_DATABASE_TYPES.PRIVATE)

const fetchDatabasesSuccess = (databases, pagination) => createAction(HOME_DATABASES_FETCH_SUCCESS, { databasesType: HOME_DATABASE_TYPES.PRIVATE, databases, pagination })

const fetchDatabasesFailure = () => createAction(HOME_DATABASES_FETCH_FAILURE, HOME_DATABASE_TYPES.PRIVATE)

export default () => (
  async (dispatch, getState) => {

    const filters = homeDatabasesFiltersSelector(getState())
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
    dispatch(fetchDatabasesStart())

    try {
      const response = await API.getDatabases(params)
      if (response.status === httpStatusCodes.OK) {
        const databases = response.payload.dbclusters ? response.payload.dbclusters.map(mapToHomeDatabase) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

        if (response.payload.meta) {
          const counters = {
            databases: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters, HOME_TABS.PRIVATE))
        }

        dispatch(fetchDatabasesSuccess(databases, pagination))
      } else {
        dispatch(fetchDatabasesFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong! Wrong response status.' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchDatabasesFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong! Action error.' }))
    }
  }
)
