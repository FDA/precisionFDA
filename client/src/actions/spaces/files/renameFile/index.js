import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  SPACE_RENAME_FILE_START,
  SPACE_RENAME_FILE_SUCCESS,
  SPACE_RENAME_FILE_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import { hideFilesActionModal } from '../index'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'


const renameFileStart = () => createAction(SPACE_RENAME_FILE_START)

const renameFileSuccess = () => createAction(SPACE_RENAME_FILE_SUCCESS)

const renameFileFailure = () => createAction(SPACE_RENAME_FILE_FAILURE)

export default (link, name) => (
  (dispatch, getState) => {
    dispatch(renameFileStart())

    return API.putApiCall(link, { name })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          dispatch(renameFileSuccess())
          dispatch(showAlertAboveAllSuccess({ message: 'File was successfully renamed.' }))
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          dispatch(renameFileFailure())
          dispatch(hideFilesActionModal())
          processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
        } else {
          dispatch(renameFileFailure())
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
