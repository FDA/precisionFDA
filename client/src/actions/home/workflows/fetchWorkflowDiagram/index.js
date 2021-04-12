import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_START,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_SUCCESS,
  HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchWorkflowDiagramStart = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_START)

const fetchWorkflowDiagramSuccess = (stages) => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_SUCCESS, stages)

const fetchWorkflowDiagramFailure = () => createAction(HOME_WORKFLOWS_FETCH_WORKFLOW_DIAGRAM_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchWorkflowDiagramStart())

    try {
      const { status, payload } = await API.getWorkflowDiagram(uid)
      if (status === httpStatusCodes.OK) {
        dispatch(fetchWorkflowDiagramSuccess(payload.data))
      } else {
        dispatch(fetchWorkflowDiagramFailure())
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
      dispatch(fetchWorkflowDiagramFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
