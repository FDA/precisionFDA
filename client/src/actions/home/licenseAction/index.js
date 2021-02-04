import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_LICENSE_ACTION_START,
  HOME_LICENSE_ACTION_SUCCESS,
  HOME_LICENSE_ACTION_FAILURE,
} from '../types'
import {
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
} from '../assets/types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'
import { OBJECT_TYPES, HOME_ASSETS_MODALS } from '../../../constants'


const licenseActionStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_LICENSE_ACTION_START)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_START, HOME_ASSETS_MODALS.LICENSE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const licenseActionSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_LICENSE_ACTION_SUCCESS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_SUCCESS, HOME_ASSETS_MODALS.LICENSE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const licenseActionFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.FILE:
      return createAction(HOME_LICENSE_ACTION_FAILURE)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_FAILURE, HOME_ASSETS_MODALS.LICENSE)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType) => (
  async (dispatch) => {
    dispatch(licenseActionStart(objectType))
    try {
      const { status, payload } = await API.postApiCall(link)
      const statusIsOK = status === httpStatusCodes.OK

      if (statusIsOK) {
        const message = payload.message

        dispatch(licenseActionSuccess(objectType))

        if (message) {
          if (message.type === 'success')
            dispatch(showAlertAboveAllSuccess({ message: message.text }))
          else if (message.type === 'warning')
            dispatch(showAlertAboveAllWarning({ message: message.text }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Successful action.' }))
        }
      } else {
        dispatch(licenseActionFailure(objectType))
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAll({ message: message_1 }))
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
