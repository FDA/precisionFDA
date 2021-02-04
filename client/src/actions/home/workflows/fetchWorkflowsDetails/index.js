import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeWorkflow } from '../../../../views/shapes/HomeWorkflowsShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_WORKFLOWS_FETCH_START,
  HOME_WORKFLOWS_FETCH_SUCCESS,
  HOME_WORKFLOWS_FETCH_FAILURE,
} from '../../types'
import { setPageCounters } from '../../index'
import { homeWorkflowsFiltersSelector } from '../../../../reducers/home/workflows/selectors'
import { HOME_WORKFLOW_TYPES } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchWorkflowsStart = () => createAction(HOME_WORKFLOWS_FETCH_START, HOME_WORKFLOW_TYPES.PRIVATE)

const fetchWorkflowsSuccess = (workflows, pagination) => createAction(HOME_WORKFLOWS_FETCH_SUCCESS, { workflowsType: HOME_WORKFLOW_TYPES.PRIVATE, workflows, pagination })

const fetchWorkflowsFailure = () => createAction(HOME_WORKFLOWS_FETCH_FAILURE, HOME_WORKFLOW_TYPES.PRIVATE)

export default () => (
  async (dispatch, getState) => {
    const filters = homeWorkflowsFiltersSelector(getState())
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

    dispatch(fetchWorkflowsStart())

    try {
      const response = await API.getWorkflows(params)

      if (response.status === httpStatusCodes.OK) {
        const workflows = response.payload.workflows ? response.payload.workflows.map(mapToHomeWorkflow) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

        if (response.payload.meta) {
          const counters = {
            workflows: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters))
        }

        dispatch(fetchWorkflowsSuccess(workflows, pagination))
      } else {
        dispatch(fetchWorkflowsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchWorkflowsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
