import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_DELETE_APP_START,
  HOME_DELETE_APP_SUCCESS,
  HOME_DELETE_APP_FAILURE,
  HOME_DELETE_FILE_START,
  HOME_DELETE_FILE_SUCCESS,
  HOME_DELETE_FILE_FAILURE,
} from '../types'
import {
  HOME_DELETE_WORKFLOW_START,
  HOME_DELETE_WORKFLOW_SUCCESS,
  HOME_DELETE_WORKFLOW_FAILURE,
} from '../workflows/types'
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


const deleteObjectseStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_DELETE_APP_START)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_DELETE_FILE_START)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_DELETE_WORKFLOW_START)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_START, HOME_ASSETS_MODALS.DELETE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const deleteObjectseSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_DELETE_APP_SUCCESS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_DELETE_FILE_SUCCESS)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_DELETE_WORKFLOW_SUCCESS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_SUCCESS, HOME_ASSETS_MODALS.DELETE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const deleteObjectseFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_DELETE_APP_FAILURE)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_DELETE_FILE_FAILURE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_DELETE_WORKFLOW_FAILURE)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_FAILURE, HOME_ASSETS_MODALS.DELETE)
    default:
      throw new Error('Unhandled object type.')
  }
}

const deleteApi = (objectType, link, ids) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return API.putApiCall(link, {
        item_ids: ids,
      })
    case OBJECT_TYPES.FILE:
      return API.postApiCall(link, {
        ids: ids,
      })
    case OBJECT_TYPES.WORKFLOW:
      return API.postApiCall(link, {
        item_ids: ids,
      })
    case OBJECT_TYPES.ASSET:
      return API.deleteApiCall(link, {
        ids: ids,
      })
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType, ids) => (
  async (dispatch) => {
    dispatch(deleteObjectseStart(objectType))

    try {
      const { status, payload } = await deleteApi(objectType, link, ids)

      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(deleteObjectseSuccess(objectType))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'error')
              dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        } else if (payload.message) {
          if (payload.message.type === 'success')
            dispatch(showAlertAboveAllSuccess({ message: payload.message.text }))
          else if (payload.message.type === 'error')
            dispatch(showAlertAboveAllWarning({ message: payload.message.text }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully deleted.' }))
        }
      } else {
        dispatch(deleteObjectseFailure(objectType))
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAll({ message: message_1 }))
        } else if (payload.failure){
          dispatch(showAlertAboveAll({ message: payload.failure }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
