import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  SPACE_DELETE_FILES_START,
  SPACE_DELETE_FILES_SUCCESS,
  SPACE_DELETE_FILES_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'
import { hideFilesActionModal } from '../index'


const deleteFilesStart = () => createAction(SPACE_DELETE_FILES_START)

const deleteFilesSuccess = (ids) => createAction(SPACE_DELETE_FILES_SUCCESS, ids)

const deleteFilesFailure = () => createAction(SPACE_DELETE_FILES_FAILURE)

export default (link, files) => (
  (dispatch, getState) => {
    dispatch(deleteFilesStart())
    const node_ids = files.map((file) => file.id)

    return API.postApiCall(link, { node_ids })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          dispatch(deleteFilesSuccess())
          dispatch(showAlertAboveAllSuccess({ message: `${files.length} file(s) successfully deleteted.` }))
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          dispatch(deleteFilesFailure())
          dispatch(hideFilesActionModal())
          processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
        } else {
          dispatch(deleteFilesFailure())
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
