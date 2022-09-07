import httpStatusCodes from 'http-status-codes'

import history from '../../../utils/history'
import { createAction, processLockedSpaceForbidden } from '../../../utils/redux'
import { spaceDataSelector } from '../../../reducers/spaces/space/selectors'
import {
  SPACE_EDITING_START,
  SPACE_EDITING_SUCCESS,
  SPACE_EDITING_FAILURE,
} from '../types'
import { putApiCall } from '../../../api/spaces'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'


const spaceEditingStart = () => createAction(SPACE_EDITING_START)
const spaceEditingSuccess = () => createAction(SPACE_EDITING_SUCCESS)
const spaceEditingFailure = (errors = {}) => createAction(SPACE_EDITING_FAILURE, errors)

export default (params, spaceId) => (
  (dispatch, getState) => {
    const space = spaceDataSelector(getState())
    const editSpaceLink = space.links.update
    dispatch(spaceEditingStart())

    return putApiCall(editSpaceLink, { space: params })
      .then(response => {
        const statusIsOk = response.status === httpStatusCodes.OK

        if (statusIsOk) {
          dispatch(spaceEditingSuccess())
          dispatch(showAlertAboveAllSuccess({ message: 'Space was successfully updated.' }))
          history.push(`/spaces/${spaceId}/files`)
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          dispatch(spaceEditingFailure())
          processLockedSpaceForbidden(dispatch, space)
        } else {
          const { payload } = response

          if (payload?.errors) {
            const message = payload.errors.messages[0]
            dispatch(spaceEditingFailure(payload))
            dispatch(showAlertAboveAll({ message: message }))
          } else {
            dispatch(spaceEditingFailure())
            dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
          }
        }

        return statusIsOk
      }).catch(e => console.error(e))
  }
)
