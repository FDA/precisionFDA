// import httpStatusCodes from 'http-status-codes'
import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import {
  HOME_DATABASES_RUN_ACTION_START,
  HOME_DATABASES_RUN_ACTION_SUCCESS,
  HOME_DATABASES_RUN_ACTION_FAILURE,
} from '../types'
import { isHttpSuccess } from '../../../../helpers'


const runDatabasesActionStart = () => createAction(HOME_DATABASES_RUN_ACTION_START)

const runDatabasesActionSuccess = () => createAction(HOME_DATABASES_RUN_ACTION_SUCCESS)

const runDatabasesActionFailure = () => createAction(HOME_DATABASES_RUN_ACTION_FAILURE)

export default (link, api_method, dxids) => (
  async (dispatch) => {
    dispatch(runDatabasesActionStart())
    try {
      const response = await API.postApiCall(link, { api_method, dxids })
      const statusIsOK = isHttpSuccess(response.status)
      if (statusIsOK) {
        dispatch(runDatabasesActionSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'The Database status was successfully changed.' }))
      } else {
        dispatch(runDatabasesActionFailure())
        if (response.payload && response.payload.error) {
          const { type, message } = response.payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return { statusIsOK }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
