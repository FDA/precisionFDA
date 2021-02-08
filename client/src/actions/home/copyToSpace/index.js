import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_COPY_APP_TO_SPACE_START,
  HOME_COPY_APP_TO_SPACE_SUCCESS,
  HOME_COPY_APP_TO_SPACE_FAILURE,
  HOME_COPY_FILE_TO_SPACE_START,
  HOME_COPY_FILE_TO_SPACE_SUCCESS,
  HOME_COPY_FILE_TO_SPACE_FAILURE,
} from '../types'
import {
  HOME_COPY_WORKFLOW_TO_SPACE_START,
  HOME_COPY_WORKFLOW_TO_SPACE_SUCCESS,
  HOME_COPY_WORKFLOW_TO_SPACE_FAILURE,
} from '../workflows/types'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../executions/types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'
import { OBJECT_TYPES, HOME_EXECUTIONS_MODALS } from '../../../constants'


const copyToSpaceStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_COPY_APP_TO_SPACE_START)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_COPY_FILE_TO_SPACE_START)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_START, HOME_EXECUTIONS_MODALS.COPY_TO_SPACE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_COPY_WORKFLOW_TO_SPACE_START)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToSpaceSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_COPY_APP_TO_SPACE_SUCCESS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_COPY_FILE_TO_SPACE_SUCCESS)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_SUCCESS, HOME_EXECUTIONS_MODALS.COPY_TO_SPACE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_COPY_WORKFLOW_TO_SPACE_SUCCESS)
    default:
      throw new Error('Unhandled object type.')
  }
}

const copyToSpaceFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_COPY_APP_TO_SPACE_FAILURE)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_COPY_FILE_TO_SPACE_FAILURE)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_FAILURE, HOME_EXECUTIONS_MODALS.COPY_TO_SPACE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_COPY_WORKFLOW_TO_SPACE_FAILURE)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType, scope, ids) => (
  async (dispatch) => {
    dispatch(copyToSpaceStart(objectType))

    try {
      const { status, payload } = await API.postApiCall(link, {
        item_ids: ids,
        scope,
      })

      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(copyToSpaceSuccess(objectType))

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
        dispatch(copyToSpaceFailure(objectType))
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAll({ message: message_1 }))
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
