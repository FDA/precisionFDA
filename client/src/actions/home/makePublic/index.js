import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_MAKE_PUBLIC_FOLDER_START,
  HOME_MAKE_PUBLIC_FOLDER_SUCCESS,
  HOME_MAKE_PUBLIC_FOLDER_FAILURE,
} from '../types'
import { OBJECT_TYPES } from '../../../constants'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const makePublicStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_MAKE_PUBLIC_FOLDER_START)
    default:
      throw new Error('Unhandled object type.')
  }
}

const makePublicSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_MAKE_PUBLIC_FOLDER_SUCCESS)
    default:
      throw new Error('Unhandled object type.')
  }
}

const makePublicFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_MAKE_PUBLIC_FOLDER_FAILURE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const getData = (objectType, ids) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return {
        ids: ids,
      }
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType, ids) => (
  async (dispatch) => {
    dispatch(makePublicStart(objectType))

    const data = getData(objectType, ids)

    try {
      const { status, payload } = await API.postApiCall(link, data)
      const statusIsOK = status === httpStatusCodes.OK

      if (statusIsOK) {
        const messages = payload.messages
        dispatch(makePublicSuccess(objectType))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning')
              dispatch(showAlertAboveAllWarning({ message: message.text }))
          })
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully published.' }))
        }
      } else {
        dispatch(makePublicFailure(objectType))

        if (payload?.error) {
          const { message } = payload.error
          dispatch(showAlertAboveAll({ message: message }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { statusIsOK, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
