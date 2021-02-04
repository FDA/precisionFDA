import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_EDIT_WORKFLOW_TAGS_START,
  HOME_EDIT_WORKFLOW_TAGS_SUCCESS,
  HOME_EDIT_WORKFLOW_TAGS_FAILURE,
  HOME_EDIT_APP_TAGS_START,
  HOME_EDIT_APP_TAGS_SUCCESS,
  HOME_EDIT_APP_TAGS_FAILURE,
} from '../types'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../executions/types'
import {
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
} from '../assets/types'
import {
  HOME_EDIT_FILE_TAGS_START,
  HOME_EDIT_FILE_TAGS_SUCCESS,
  HOME_EDIT_FILE_TAGS_FAILURE,
} from '../types'
import {
  showAlertAboveAll,
} from '../../alertNotifications'
import { HOME_EXECUTIONS_MODALS, OBJECT_TYPES, HOME_ASSETS_MODALS } from '../../../constants'


const editTagsStart = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_EDIT_APP_TAGS_START)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_START, HOME_EXECUTIONS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_START, HOME_ASSETS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_EDIT_FILE_TAGS_START)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_EDIT_WORKFLOW_TAGS_START)
    default:
      throw new Error('Unhandled object type.')
  }
}

const editTagsSuccess = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_EDIT_APP_TAGS_SUCCESS)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_SUCCESS, HOME_EXECUTIONS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_SUCCESS, HOME_ASSETS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_EDIT_FILE_TAGS_SUCCESS)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_EDIT_WORKFLOW_TAGS_SUCCESS)
    default:
      throw new Error('Unhandled object type.')
  }
}

const editTagsFailure = (objectType) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_EDIT_APP_TAGS_FAILURE)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTION_MODAL_ACTION_FAILURE, HOME_EXECUTIONS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MODAL_ACTION_FAILURE, HOME_ASSETS_MODALS.EDIT_TAGS)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_EDIT_FILE_TAGS_FAILURE)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_EDIT_WORKFLOW_TAGS_FAILURE)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (uid, tags, suggestedTags, objectType) => (
  async (dispatch) => {
    dispatch(editTagsStart(objectType))

    try {
      const data = {
        taggable_uid: uid,
        tags,
        suggested_tags: suggestedTags,
      }
      const { status, payload } = await API.postApiCall('/api/set_tags', data)
      
      if (status === httpStatusCodes.OK) {
        dispatch(editTagsSuccess(objectType))
      } else {
        dispatch(editTagsFailure(objectType))
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
      dispatch(editTagsFailure(objectType))
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
