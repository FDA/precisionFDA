import httpStatusCodes from 'http-status-codes'
import { toast } from 'react-toastify'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_APPS_ATTACH_TO_START,
  HOME_APPS_ATTACH_TO_SUCCESS,
  HOME_APPS_ATTACH_TO_FAILURE,
  HOME_FILES_ATTACH_TO_START,
  HOME_FILES_ATTACH_TO_SUCCESS,
  HOME_FILES_ATTACH_TO_FAILURE,
} from '../types'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../executions/types'
import {
  HOME_WORKFLOWS_ATTACH_TO_START,
  HOME_WORKFLOWS_ATTACH_TO_SUCCESS,
  HOME_WORKFLOWS_ATTACH_TO_FAILURE,
} from '../workflows/types'
import {
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
} from '../assets/types'
import { OBJECT_TYPES, HOME_EXECUTIONS_MODALS, HOME_ASSETS_MODALS } from '../../../constants'


const attachToStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_APPS_ATTACH_TO_START)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_FILES_ATTACH_TO_START)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_START, HOME_EXECUTIONS_MODALS.ATTACH_TO)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_WORKFLOWS_ATTACH_TO_START)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_START, HOME_ASSETS_MODALS.ATTACH_TO)
    default:
      throw new Error('Unhandled object type.')
  }
}

const attachToSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_APPS_ATTACH_TO_SUCCESS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_FILES_ATTACH_TO_SUCCESS)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_SUCCESS, HOME_EXECUTIONS_MODALS.ATTACH_TO)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_WORKFLOWS_ATTACH_TO_SUCCESS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_SUCCESS, HOME_ASSETS_MODALS.ATTACH_TO)
    default:
      throw new Error('Unhandled object type.')
  }
}

const attachToFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_APPS_ATTACH_TO_FAILURE)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_FILES_ATTACH_TO_FAILURE)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_FAILURE, HOME_EXECUTIONS_MODALS.ATTACH_TO)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_WORKFLOWS_ATTACH_TO_FAILURE)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_FAILURE, HOME_ASSETS_MODALS.ATTACH_TO)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (objectType, items, noteUids) => (
  async (dispatch) => {
    dispatch(attachToStart(objectType))

    try {
      const { status, payload } = await API.postApiCall('/api/attach_to_notes', {
        items,
        note_uids: noteUids,
      })

      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(attachToSuccess(objectType))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              toast.success(message.message)
              // dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning')
              toast.error(message.message)
              // dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        } else {
          toast.success('Objects attached successfully.')
          // dispatch(showAlertAboveAllSuccess({ message: 'Objects attached successfully.' }))
        }
      } else {
        dispatch(attachToFailure(objectType))
        if (payload?.error) {
          const { message: message_1 } = payload.error
          toast.error(message_1)
          // dispatch(showAlertAboveAll({ message: message_1 }))
        } else {
          toast.error('Something went wrong!')
          // dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      toast.error('Something went wrong!')
      // dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
