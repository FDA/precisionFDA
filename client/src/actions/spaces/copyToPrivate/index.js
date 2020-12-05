import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import { postApiCall } from '../../../api/spaces'
import {
  COPY_APPS_TO_PRIVATE_START,
  COPY_APPS_TO_PRIVATE_SUCCESS,
  COPY_APPS_TO_PRIVATE_FAILURE,
  COPY_FILES_TO_PRIVATE_START,
  COPY_FILES_TO_PRIVATE_SUCCESS,
  COPY_FILES_TO_PRIVATE_FAILURE,
} from '../types'
import { OBJECT_TYPES } from '../../../constants'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const copyToPrivateStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(COPY_APPS_TO_PRIVATE_START)
    case OBJECT_TYPES.FILE:
      return createAction(COPY_FILES_TO_PRIVATE_START)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToPrivateSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(COPY_APPS_TO_PRIVATE_SUCCESS)
    case OBJECT_TYPES.FILE:
      return createAction(COPY_FILES_TO_PRIVATE_SUCCESS)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToPrivateFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(COPY_APPS_TO_PRIVATE_FAILURE)
    case OBJECT_TYPES.FILE:
      return createAction(COPY_FILES_TO_PRIVATE_FAILURE)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, ids, objectType) => (
  (dispatch) => {
    dispatch(copyToPrivateStart(objectType))

    return postApiCall(link, {
      item_ids: ids,
      scope: 'private',
    }).then(({ status, payload }) => {
      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(copyToPrivateSuccess(objectType))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success') dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning') dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully copied.' }))
        }
      } else {
        dispatch(copyToPrivateFailure(objectType))

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
