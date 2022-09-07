import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToJob } from '../../../../views/shapes/HomeJobShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_EXECUTIONS_FETCH_START,
  HOME_EXECUTIONS_FETCH_SUCCESS,
  HOME_EXECUTIONS_FETCH_FAILURE,
} from '../types'
import { setPageCounters } from '../../index'
import { homeExecutionsFeaturedFiltersSelector } from '../../../../reducers/home/executions/selectors'
import { HOME_ENTRIES_TYPES, HOME_TABS } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchExecutionsStart = () => createAction(HOME_EXECUTIONS_FETCH_START, HOME_ENTRIES_TYPES.FEATURED)

const fetchExecutionsSuccess = (executions, pagination) => createAction(HOME_EXECUTIONS_FETCH_SUCCESS, { executionsType: HOME_ENTRIES_TYPES.FEATURED, executions, pagination })

const fetchExecutionsFailure = () => createAction(HOME_EXECUTIONS_FETCH_FAILURE, HOME_ENTRIES_TYPES.FEATURED)

export default () => (
  async (dispatch, getState) => {
    const filters = homeExecutionsFeaturedFiltersSelector(getState())
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

    dispatch(fetchExecutionsStart())

    try {
      const response = await API.getExecutionsFeatured(params)

      if (response.status === httpStatusCodes.OK) {
        const executions = response.payload.jobs ? response.payload.jobs.map(mapToJob) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

        if (response.payload.meta) {
          const counters = {
            jobs: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters, HOME_TABS.FEATURED))
        }

        dispatch(fetchExecutionsSuccess(executions, pagination))
      } else {
        dispatch(fetchExecutionsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchExecutionsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
