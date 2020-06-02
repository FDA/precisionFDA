import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import {
  SPACE_CREATION_FETCH_INFO_START,
  SPACE_CREATION_FETCH_INFO_SUCCESS,
  SPACE_CREATION_FETCH_INFO_FAILURE,
} from '../types'
import { fetchNewSpaceInfo } from '../../../api/spaces'


const spaceCreationFetchInfoStart = () => createAction(SPACE_CREATION_FETCH_INFO_START)

const spaceCreationFetchInfoSuccess = (info) => createAction(SPACE_CREATION_FETCH_INFO_SUCCESS, info)

const spaceCreationFetchInfoFailure = () => createAction(SPACE_CREATION_FETCH_INFO_FAILURE)

export default () => (
  (dispatch, getState) => {
    const route = getState().context.links.space_info

    dispatch(spaceCreationFetchInfoStart())

    return fetchNewSpaceInfo(route)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          dispatch(spaceCreationFetchInfoSuccess(response.payload))
        } else {
          dispatch(spaceCreationFetchInfoFailure(response.payload))
        }
      })
      .catch(e => console.error(e))
  }
)
