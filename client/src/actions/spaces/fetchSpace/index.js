import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/spaces'
import {
  SPACE_FETCH_START,
  SPACE_FETCH_SUCCESS,
  SPACE_FETCH_FAILURE,
} from '../types'
import { mapToSpace } from '../../../views/shapes/SpaceShape'
import { showAlertAboveAll } from '../../alertNotifications'
import { setErrorPage } from '../../../views/components/ErrorWrapper/actions'
import { ERROR_PAGES } from '../../../constants'


const fetchSpaceStart = () => createAction(SPACE_FETCH_START)

const fetchSpaceSuccess = (space) => createAction(SPACE_FETCH_SUCCESS, space)

const fetchSpaceFailure = () => createAction(SPACE_FETCH_FAILURE)

const fetchSpace = (spaceId) => (
  (dispatch) => {
    dispatch(fetchSpaceStart())
    return API.getSpace(spaceId)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const space = mapToSpace(response.payload.space)
          dispatch(fetchSpaceSuccess(space))
        } else {
          dispatch(fetchSpaceFailure())

          if (response.status === httpStatusCodes.NOT_FOUND) {
            dispatch(setErrorPage(ERROR_PAGES.NOT_FOUND))
          } else if (response.status === httpStatusCodes.UNPROCESSABLE_ENTITY) {
            dispatch(setErrorPage(ERROR_PAGES.LOCKED_SPACE))
          } else {
            dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
          }
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)

export {
  fetchSpace,
  fetchSpaceSuccess,
}
