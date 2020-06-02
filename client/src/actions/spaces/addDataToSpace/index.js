import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  ADD_DATA_TO_SPACE_START,
  ADD_DATA_TO_SPACE_SUCCESS,
  ADD_DATA_TO_SPACE_FAILURE,
} from '../types'
import {
  showAlertAboveAllSuccess,
  showAlertAboveAll,
} from '../../alertNotifications'
import { spaceDataSelector } from '../../../reducers/spaces/space/selectors'
import { hideSpaceAddDataModal } from '../index'


const addDataToSpaceStart = () => createAction(ADD_DATA_TO_SPACE_START)

const addDataToSpaceSuccess = () => createAction(ADD_DATA_TO_SPACE_SUCCESS)

const addDataToSpaceFailure = (response) => createAction(ADD_DATA_TO_SPACE_FAILURE, response)

const addDataToSpace = (uids, folder_id) => (
  (dispatch, getState) => {
    const space = spaceDataSelector(getState())
    const link = `/api/spaces/${space.id}/add_data/`
    dispatch(addDataToSpaceStart())

    return postApiCall(link, { uids, folder_id }).then(response => {
      const isStatusOk = response.status === httpStatusCodes.OK
      if (isStatusOk) {
        dispatch(addDataToSpaceSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'Objects successfully added to space.' }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        dispatch(addDataToSpaceFailure())
        dispatch(hideSpaceAddDataModal())
        processLockedSpaceForbidden(dispatch, space)
      } else {
        dispatch(addDataToSpaceFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }

      return isStatusOk
    }).catch(e => {
      console.error(e)
      dispatch(addDataToSpaceFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)

export {
  addDataToSpace,
}
