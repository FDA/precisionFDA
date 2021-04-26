import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToHomeWorkflow } from '../../../../views/shapes/HomeWorkflowsShape'
import * as API from '../../../../api/home'
import {
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchWorkflowDetailsStart = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_START)

const fetchWorkflowDetailsSuccess = (workflow, meta) => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_SUCCESS, { workflow, meta })

const fetchWorkflowDetailsFailure = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DETAILS_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchWorkflowDetailsStart())

    try {
      const { status, payload } = await API.getWorkflowDetails(uid)
      if (status === httpStatusCodes.OK) {
        const workflow = mapToHomeWorkflow(payload.workflow)
        const meta = payload.meta

        dispatch(fetchWorkflowDetailsSuccess(workflow, meta))
      } else {
        dispatch(fetchWorkflowDetailsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAllSuccess({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(fetchWorkflowDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
