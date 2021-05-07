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
        if (response.payload && response.payload.message) {
          const { type, text } = response.payload.message
          var textString
          if (Array.isArray(text)) {
            textString = text.join(' \n')
          } else {
            textString = text
          }
          if (type === 'error') dispatch(showAlertAboveAll({ message: textString }))
          if (type === 'success') dispatch(showAlertAboveAllSuccess({ message: textString }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Folder successfully created.' }))
        }
      } else {
        dispatch(createFolderFailure())
        if (response.payload && response.payload.message) {
          const { type, text } = response.payload.message
          if (type === 'error') dispatch(showAlertAboveAll({ message: text }))
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
