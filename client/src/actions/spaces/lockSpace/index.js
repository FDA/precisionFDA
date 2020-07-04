import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  LOCK_SPACE_START,
  LOCK_SPACE_SUCCESS,
  LOCK_SPACE_FAILURE,
} from '../types'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'
import { mapToSpace } from '../../../views/shapes/SpaceShape'
import { fetchSpace } from '../fetchSpace'
import { spaceDataSelector } from '../../../reducers/spaces/space/selectors'


const lockSpaceStart = () => createAction(LOCK_SPACE_START)

const lockSpaceSuccess = (space) => createAction(LOCK_SPACE_SUCCESS, space)

const lockSpaceFailure = () => createAction(LOCK_SPACE_FAILURE)

const lockSpace = (lockLink) => (
  (dispatch, getState) => {
    dispatch(lockSpaceStart())
    return postApiCall(lockLink).then(response => {
      if (response.status === httpStatusCodes.OK) {
        const space = mapToSpace(response.payload.space)
        dispatch(lockSpaceSuccess(space))
        dispatch(showAlertAboveAllSuccess({ message: 'Space successfully locked.' }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        const space = spaceDataSelector(getState())
        dispatch(fetchSpace(space.id))
        dispatch(showAlertAboveAllSuccess({ message: 'Space successfully locked.' }))
      } else {
        dispatch(lockSpaceFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    }).catch(e => {
      console.info('lockSpace', e)
      dispatch(lockSpaceFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)

export {
  lockSpace,
}
