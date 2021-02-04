import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_RENAME_FILE_START,
  HOME_RENAME_FILE_SUCCESS,
  HOME_RENAME_FILE_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const renameFileStart = () => createAction(HOME_RENAME_FILE_START)

const renameFileSuccess = () => createAction(HOME_RENAME_FILE_SUCCESS)

const renameFileFailure = () => createAction(HOME_RENAME_FILE_FAILURE)

export default (link, name, description, type, folder_id) => (
  async (dispatch) => {
    dispatch(renameFileStart())
    try {
      
      const response = type === 'Folder' ? await API.postApiCall(link, { folder_id, name }) : await API.putApiCall(link, { name, description })
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        dispatch(renameFileSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'File was successfully renamed.' }))
      } else {
        dispatch(renameFileFailure())
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
