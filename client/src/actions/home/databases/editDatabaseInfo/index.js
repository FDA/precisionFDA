import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import {
  HOME_DATABASE_EDIT_INFO_FAILURE,
  HOME_DATABASE_EDIT_INFO_START,
  HOME_DATABASE_EDIT_INFO_SUCCESS,
} from '../types'


const editDatabaseInfoStart = () => createAction(HOME_DATABASE_EDIT_INFO_START)

const editDatabaseInfoSuccess = () => createAction(HOME_DATABASE_EDIT_INFO_SUCCESS)

const editDatabaseInfoFailure = () => createAction(HOME_DATABASE_EDIT_INFO_FAILURE)

export default (link, name, description) => (
  async (dispatch) => {
    dispatch(editDatabaseInfoStart())
    try {
      const response = await API.putApiCall(link, { name, description })
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        dispatch(editDatabaseInfoSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'The Database info was successfully changed.' }))
      } else {
        dispatch(editDatabaseInfoFailure())
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
