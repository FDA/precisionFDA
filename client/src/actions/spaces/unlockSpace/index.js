import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  UNLOCK_SPACE_START,
  UNLOCK_SPACE_SUCCESS,
  UNLOCK_SPACE_FAILURE,
} from '../types'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'
import { mapToSpace } from '../../../views/shapes/SpaceShape'
import { spaceDataSelector } from '../../../reducers/spaces/space/selectors'
import { fetchSpace } from '../fetchSpace'


const unlockSpaceStart = () => createAction(UNLOCK_SPACE_START)

const unlockSpaceSuccess = (space) => createAction(UNLOCK_SPACE_SUCCESS, space)

const unlockSpaceFailure = () => createAction(UNLOCK_SPACE_FAILURE)

const unlockSpace = (unlockLink) => (
  (dispatch, getState) => {
    dispatch(unlockSpaceStart())
    return postApiCall(unlockLink).then(response => {
      if (response.status === httpStatusCodes.OK) {
        const space = mapToSpace(response.payload.space)
        dispatch(unlockSpaceSuccess(space))
        dispatch(showAlertAboveAllSuccess({ message: 'Space successfully unlocked.' }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        const space = spaceDataSelector(getState())
        dispatch(fetchSpace(space.id))
        dispatch(showAlertAboveAllSuccess({ message: 'Space successfully unlocked.' }))
      } else {
        dispatch(unlockSpaceFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    }).catch(e => {
      console.info('unlockSpace', e)
      dispatch(unlockSpaceFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)

export {
  unlockSpace,
}
