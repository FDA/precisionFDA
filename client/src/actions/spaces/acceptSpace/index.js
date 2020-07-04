import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { acceptSpace } from '../../../api/spaces'
import {
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'
import {
  SPACE_ACCEPT_START,
  SPACE_ACCEPT_SUCCESS,
  SPACE_ACCEPT_FAILURE,
} from '../types'
import { fetchSpaceSuccess } from '../fetchSpace'
import { mapToSpace } from '../../../views/shapes/SpaceShape'


const acceptSpaceStart = () => createAction(SPACE_ACCEPT_START)

const acceptSpaceSuccess = () => createAction(SPACE_ACCEPT_SUCCESS)

const acceptSpaceFailure = () => createAction(SPACE_ACCEPT_FAILURE)

export default (space) => (
  (dispatch) => {
    dispatch(acceptSpaceStart())

    return acceptSpace(space.links.accept)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          dispatch(acceptSpaceSuccess())
          dispatch(fetchSpaceSuccess(mapToSpace(response.payload.space)))
          dispatch(showAlertAboveAllSuccess({ message: 'Space successfully accepted' }))
        } else if (response.status === httpStatusCodes.FORBIDDEN) {
          dispatch(acceptSpaceFailure())
          dispatch(showAlertAboveAllWarning({ message: "You're not allowed to accept this space" }))
        } else {
          dispatch(acceptSpaceFailure())
          dispatch(showAlertAboveAllWarning({ message: 'Something went wrong' }))
        }
      }).catch(e => {
        console.error(e)
        dispatch(acceptSpaceFailure())
        dispatch(showAlertAboveAllWarning({ message: 'Something went wrong' }))
      })
  }
)
