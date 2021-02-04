import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  HOME_ADD_FOLDER_START,
  HOME_ADD_FOLDER_SUCCESS,
  HOME_ADD_FOLDER_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const createFolderStart = () => createAction(HOME_ADD_FOLDER_START)

const createFolderSuccess = () => createAction(HOME_ADD_FOLDER_SUCCESS)

const createFolderFailure = () => createAction(HOME_ADD_FOLDER_FAILURE)

export default (link, name, folderId, isPublic) => (
  async (dispatch) => {
    dispatch(createFolderStart())

    try {
      const response = await API.postApiCall(link, { name, parent_folder_id: folderId, public: isPublic })
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        dispatch(createFolderSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'Folder successfully created.' }))
      } else {
        dispatch(createFolderFailure())
        if (response.payload && response.payload.error) {
          const { message } = response.payload.error
          dispatch(showAlertAboveAll({ message }))
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
