import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  SPACE_PUBLISH_FILES_START,
  SPACE_PUBLISH_FILES_SUCCESS,
  SPACE_PUBLISH_FILES_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'
import { hideFilesActionModal } from '../index'


const publishFilesStart = () => createAction(SPACE_PUBLISH_FILES_START)

const publishFilesSuccess = (ids) => createAction(SPACE_PUBLISH_FILES_SUCCESS, ids)

const publishFilesFailure = () => createAction(SPACE_PUBLISH_FILES_FAILURE)

export default (link, files) => (
  (dispatch, getState) => {
    dispatch(publishFilesStart())
    const ids = files.map((file) => file.id.toString())

    return API.postApiCall(link, { ids })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          dispatch(publishFilesSuccess())
          dispatch(showAlertAboveAllSuccess({ message: `${files.length} file(s) successfully published.` }))
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          dispatch(publishFilesSuccess())
          dispatch(hideFilesActionModal())
          processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
        } else {
          dispatch(publishFilesFailure())
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
