import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import { mapToJob } from '../../../../views/shapes/HomeJobShape'
import * as API from '../../../../api/home'
import {
  HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_SUCCESS,
  HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_FAILURE,
} from '../../workflows/types'
import { homeWorkflowsWorkflowExecutionsSelector } from '../../../../reducers/home/workflows/selectors'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchWorkflowExecutionsStart = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_START)

const fetchWorkflowExecutionsSuccess = (pagination, jobs) => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_SUCCESS, { jobs, pagination })

const fetchWorkflowExecutionsFailure = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_EXECUTIONS_FAILURE)

export default (uid) => (
  async (dispatch, getState) => {
    const { filters } = homeWorkflowsWorkflowExecutionsSelector(getState())
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

    dispatch(fetchWorkflowExecutionsStart())

    try {
      const { status, payload } = await API.getWorkflowExecutions(uid, params)

      if (status === httpStatusCodes.OK) {
        const jobs = payload.jobs ? payload.jobs.map(mapToJob) : []
        const pagination = payload.meta ? mapToPagination(payload.meta.pagination) : {}

        dispatch(fetchWorkflowExecutionsSuccess(pagination, jobs))
      } else {
        dispatch(fetchWorkflowExecutionsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAllSuccess({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchWorkflowExecutionsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
