import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  FETCH_ACCESSIBLE_WORKFLOWS_START,
  FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS,
  FETCH_ACCESSIBLE_WORKFLOWS_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import { mapToAccessibleWorkflow } from '../../../../views/shapes/AccessibleObjectsShape'
import { contextLinksSelector } from '../../../../reducers/context/selectors'


const fetchAccessibleWorkflowsStart = () => createAction(FETCH_ACCESSIBLE_WORKFLOWS_START)

const fetchAccessibleWorkflowsSuccess = (workflows) => createAction(FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS, workflows)

const fetchAccessibleWorkflowsFailure = () => createAction(FETCH_ACCESSIBLE_WORKFLOWS_FAILURE)

export default () => (
  (dispatch, getState) => {
    const state = getState()
    const links = contextLinksSelector(state)
    const scopes = ['private']

    dispatch(fetchAccessibleWorkflowsStart())
    return API.postApiCall(links.accessible_workflows, { scopes })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          const workflows = response.payload.map(mapToAccessibleWorkflow)
          dispatch(fetchAccessibleWorkflowsSuccess(workflows))
        } else {
          dispatch(fetchAccessibleWorkflowsFailure())
          if (response.payload && response.payload.error) {
            const { type, message } = response.payload.error
            dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
          } else {
            dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
          }
        }
        return statusIsOK
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
