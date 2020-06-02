import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/files'
import {
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
} from '../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const copyToSpaceStart = () => createAction(COPY_OBJECTS_TO_SPACE_START)

const copyToSpaceSuccess = () => createAction(COPY_OBJECTS_TO_SPACE_SUCCESS)

const copyToSpaceFailure = () => createAction(COPY_OBJECTS_TO_SPACE_FAILURE)

export default (link, scope, ids) => (
  (dispatch) => {
    dispatch(copyToSpaceStart())
    return API.postApiCall(link, {
      item_ids: ids,
      scope,
    }).then(({ status, payload }) => {
      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(copyToSpaceSuccess())

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success') dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning') dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully copied.' }))
        }
      } else {
        dispatch(copyToSpaceFailure())
        if (payload?.error) {
          const { type, message } = payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
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
