import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import { mapToJob } from '../../../../views/shapes/HomeJobShape'
import * as API from '../../../../api/home'
import {
  HOME_APPS_FETCH_APP_EXECUTIONS_START,
  HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS,
  HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE,
} from '../../types'
import { homeAppsAppExecutionsSelector } from '../../../../reducers/home/apps/selectors'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchAppExecutionsStart = () => createAction(HOME_APPS_FETCH_APP_EXECUTIONS_START)

const fetchAppExecutionsSuccess = (pagination, jobs) => createAction(HOME_APPS_FETCH_APP_EXECUTIONS_SUCCESS, { pagination, jobs })

const fetchAppExecutionsFailure = () => createAction(HOME_APPS_FETCH_APP_EXECUTIONS_FAILURE)

export default (uid) => (
  async (dispatch, getState) => {
    const { filters } = homeAppsAppExecutionsSelector(getState())
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

    dispatch(fetchAppExecutionsStart())

    try {
      const { status, payload } = await API.getAppExecutions(uid, params)

      if (status === httpStatusCodes.OK) {
        const jobs = payload.jobs ? payload.jobs.map(mapToJob) : []
        const pagination = payload.meta ? mapToPagination(payload.meta.pagination) : {}

        dispatch(fetchAppExecutionsSuccess(pagination, jobs))
      } else {
        dispatch(fetchAppExecutionsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAllSuccess({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchAppExecutionsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
