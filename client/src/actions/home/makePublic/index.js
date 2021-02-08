import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_MAKE_PUBLICK_APP_START,
  HOME_MAKE_PUBLICK_APP_SUCCESS,
  HOME_MAKE_PUBLICK_APP_FAILURE,
} from '../types'
import {
  HOME_MAKE_PUBLIC_WORKFLOW_START,
  HOME_MAKE_PUBLIC_WORKFLOW_SUCCESS,
  HOME_MAKE_PUBLIC_WORKFLOW_FAILURE,
} from '../workflows/types'
import { OBJECT_TYPES } from '../../../constants'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const copyToPrivateStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_MAKE_PUBLICK_APP_START)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_MAKE_PUBLIC_WORKFLOW_START)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToPrivateSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_MAKE_PUBLICK_APP_SUCCESS)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_MAKE_PUBLIC_WORKFLOW_SUCCESS)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToPrivateFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_MAKE_PUBLICK_APP_FAILURE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_MAKE_PUBLIC_WORKFLOW_FAILURE)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType, ids) => (
  async (dispatch) => {
    dispatch(copyToPrivateStart(objectType))

    try {
      const { status, payload } = await API.postApiCall(link, {
        item_ids: ids,
        scope: 'public',
      })
      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(copyToPrivateSuccess(objectType))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning')
              dispatch(showAlertAboveAllWarning({ message: message.message }))
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
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
