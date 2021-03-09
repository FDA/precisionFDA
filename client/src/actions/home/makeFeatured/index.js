import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_APPS_MAKE_FEATURED_SUCCESS,
  HOME_FILES_MAKE_FEATURED_SUCCESS,
} from '../types'
import { HOME_ASSETS_MAKE_FEATURED_SUCCESS } from '../assets/types'
import { HOME_WORKFLOWS_MAKE_FEATURED_SUCCESS } from '../workflows/types'
import { HOME_EXECUTIONS_MAKE_FEATURED_SUCCESS } from '../executions/types'
import { mapToHomeApp } from '../../../views/shapes/HomeAppShape'
import { mapToHomeFile } from '../../../views/shapes/HomeFileShape'
import { mapToHomeWorkflow } from '../../../views/shapes/HomeWorkflowsShape'
import { mapToHomeAsset } from '../../../views/shapes/HomeAssetShape'
import { mapToJob } from '../../../views/shapes/HomeJobShape'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'
import { OBJECT_TYPES } from '../../../constants'


const makeFeaturedSuccess = (objectType, items) => {
  switch (objectType) {
    case OBJECT_TYPES.APP:
      return createAction(HOME_APPS_MAKE_FEATURED_SUCCESS, items)
    case OBJECT_TYPES.FILE:
      return createAction(HOME_FILES_MAKE_FEATURED_SUCCESS, items)
    case OBJECT_TYPES.WORKFLOW:
      return createAction(HOME_WORKFLOWS_MAKE_FEATURED_SUCCESS, items)
    case OBJECT_TYPES.ASSET:
      return createAction(HOME_ASSETS_MAKE_FEATURED_SUCCESS, items)
    case OBJECT_TYPES.JOB:
      return createAction(HOME_EXECUTIONS_MAKE_FEATURED_SUCCESS, items)
    default:
      throw new Error('Unhandled object type.')
  }
}

export default (link, objectType, uids, featured) => (
  async (dispatch) => {
    try {
      const data = {
        item_ids: uids,
      }
      if (featured) data.featured = true

      const { status, payload } = await API.putApiCall(link, data)

      if (status === httpStatusCodes.OK) {
        const messages = payload.meta
        let items = []
        switch (objectType) {
          case OBJECT_TYPES.APP:
            items = payload.items ? payload.items.map(mapToHomeApp) : []
            break
          case OBJECT_TYPES.FILE:
            items = payload.items ? payload.items.map(mapToHomeFile) : []
            break
          case OBJECT_TYPES.WORKFLOW:
            items = payload.items ? payload.items.map(mapToHomeWorkflow) : []
            break
          case OBJECT_TYPES.ASSET:
            items = payload.items ? payload.items.map(mapToHomeAsset) : []
            break
          case OBJECT_TYPES.JOB:
            items = payload.items ? payload.items.map(mapToJob) : []
            break
          default:
            throw new Error('Unhandled object type.')
        }

        dispatch(makeFeaturedSuccess(objectType, items))

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
