import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  COPY_OBJECTS_TO_PRIVATE_START,
  COPY_OBJECTS_TO_PRIVATE_SUCCESS,
  COPY_OBJECTS_TO_PRIVATE_FAILURE,
} from '../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const copyToPrivateStart = () => createAction(COPY_OBJECTS_TO_PRIVATE_START)

const copyToPrivateSuccess = () => createAction(COPY_OBJECTS_TO_PRIVATE_SUCCESS)

const copyToPrivateFailure = () => createAction(COPY_OBJECTS_TO_PRIVATE_FAILURE)

export default (link, ids) => (
  (dispatch) => {
    dispatch(copyToPrivateStart())
    return postApiCall(link, {
      item_ids: ids,
      scope: 'private',
    }).then(({ status, payload }) => {
      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(copyToPrivateSuccess())

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success') dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning') dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully copied.' }))
        }
      } else {
        dispatch(copyToPrivateFailure())
        if (payload?.error) {
          const { message } = payload.error
          dispatch(showAlertAboveAll({ message: message }))
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
