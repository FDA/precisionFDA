import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  SPACE_ADD_FOLDER_START,
  SPACE_ADD_FOLDER_SUCCESS,
  SPACE_ADD_FOLDER_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'
import { hideFilesAddFolderModal } from '../index'


const createFolderStart = () => createAction(SPACE_ADD_FOLDER_START)

const createFolderSuccess = () => createAction(SPACE_ADD_FOLDER_SUCCESS)

const createFolderFailure = () => createAction(SPACE_ADD_FOLDER_FAILURE)

export default (link, name, folderId) => (
  (dispatch, getState) => {
    dispatch(createFolderStart())

    return API.postApiCall(link, { name, parent_folder_id: folderId })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          dispatch(createFolderSuccess())
          dispatch(showAlertAboveAllSuccess({ message: 'Folder successfully created.' }))
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          const space = spaceDataSelector(getState())
          dispatch(createFolderFailure())
          dispatch(hideFilesAddFolderModal())
          processLockedSpaceForbidden(dispatch, space)
        } else {
          dispatch(createFolderFailure())
          if (response.payload && response.payload.error) {
            const { message } = response.payload.error
            dispatch(showAlertAboveAll({ message }))
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
