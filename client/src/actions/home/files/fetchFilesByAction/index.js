import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  HOME_FETCH_FILES_BY_ACTION_START,
  HOME_FETCH_FILES_BY_ACTION_SUCCESS,
  HOME_FETCH_FILES_BY_ACTION_FAILURE,
} from '../../types'
import { mapToFileActionItem } from '../../../../views/shapes/FileShape'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchFilesByActionStart = (action) => createAction(HOME_FETCH_FILES_BY_ACTION_START, action)

const fetchFilesByActionSuccess = (action, files) => createAction(HOME_FETCH_FILES_BY_ACTION_SUCCESS, { action, files })

const fetchFilesByActionFailure = () => createAction(HOME_FETCH_FILES_BY_ACTION_FAILURE)

export default (ids, action) => (
  (dispatch) => {
    dispatch(fetchFilesByActionStart(action))
    return API.getFilesByAction(ids, action, 'private')
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const files = response.payload.map(mapToFileActionItem)
          dispatch(fetchFilesByActionSuccess(action, files))
        } else {
          dispatch(fetchFilesByActionFailure())
          if (response.payload && response.payload.error) {
            const { type, message } = response.payload.error
            dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
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
