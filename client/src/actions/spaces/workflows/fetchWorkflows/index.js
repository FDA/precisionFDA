import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToWorkflow } from '../../../../views/shapes/WorkflowShape'
import {
  SPACE_WORKFLOWS_FETCH_START,
  SPACE_WORKFLOWS_FETCH_SUCCESS,
  SPACE_WORKFLOWS_FETCH_FAILURE,
} from '../../types'
import {
  spaceWorkflowsListSortTypeSelector,
  spaceWorkflowsListSortDirectionSelector,
} from '../../../../reducers/spaces/workflows/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchWorkflowsStart = () => createAction(SPACE_WORKFLOWS_FETCH_START)

const fetchWorkflowsSuccess = (workflows, links) => createAction(SPACE_WORKFLOWS_FETCH_SUCCESS, { workflows, links })

const fetchWorkflowsFailure = () => createAction(SPACE_WORKFLOWS_FETCH_FAILURE)

export default (spaceId) => (
  (dispatch, getState) => {
    const sortType = spaceWorkflowsListSortTypeSelector(getState())
    const sortDir = spaceWorkflowsListSortDirectionSelector(getState())

    let params = {}

    if (sortType) {
      params = { order_by: sortType, order_dir: sortDir }
    }

    dispatch(fetchWorkflowsStart())

    return API.getWorkflows(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const workflows = response.payload.workflows.map(mapToWorkflow)
          const links = response.payload.meta.links
          dispatch(fetchWorkflowsSuccess(workflows, links))
        } else {
          dispatch(fetchWorkflowsFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
