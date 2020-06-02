import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  DELETE_SPACE_START,
  DELETE_SPACE_SUCCESS,
  DELETE_SPACE_FAILURE,
} from '../types'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'
import history from '../../../utils/history'


const deleteSpaceStart = () => createAction(DELETE_SPACE_START)

const deleteSpaceSuccess = () => createAction(DELETE_SPACE_SUCCESS)

const deleteSpaceFailure = () => createAction(DELETE_SPACE_FAILURE)

const deleteSpace = (deleteLink) => (
  (dispatch) => {
    dispatch(deleteSpaceStart())
    return postApiCall(deleteLink).then(response => {
      if (response.status === httpStatusCodes.OK) {
        dispatch(deleteSpaceSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'Space was deleted successfully.' }))
        history.push('/spaces')
      } else {
        dispatch(deleteSpaceFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    }).catch(e => {
      console.info('deleteSpace', e)
      dispatch(deleteSpaceFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)

export {
  deleteSpace,
}
