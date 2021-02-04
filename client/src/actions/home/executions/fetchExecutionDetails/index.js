import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { getExecution } from '../../../../views/shapes/HomeJobShape'
import * as API from '../../../../api/home'
import {
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS,
  HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchExecutionDetailsStart = () => createAction(HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_START)

const fetchExecutionDetailsSuccess = (execution, meta) => createAction(HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_SUCCESS, { execution, meta })

const fetchExecutionDetailsFailure = () => createAction(HOME_EXECUTIONS_FETCH_EXECUTION_DETAILS_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchExecutionDetailsStart())

    try {
      const { status, payload } = await API.getExecutionDetails(uid)
      if (status === httpStatusCodes.OK) {
        const execution = getExecution(payload.job)
        const meta = payload.meta

        dispatch(fetchExecutionDetailsSuccess(execution, meta))
      } else {
        dispatch(fetchExecutionDetailsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(fetchExecutionDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
