import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_EXECUTION_MODAL_ACTION_START,
  HOME_EXECUTION_MODAL_ACTION_SUCCESS,
  HOME_EXECUTION_MODAL_ACTION_FAILURE,
} from '../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../../alertNotifications'
import { HOME_EXECUTIONS_MODALS } from '../../../../constants'


const syncFilesStart = () => createAction(HOME_EXECUTION_MODAL_ACTION_START, HOME_EXECUTIONS_MODALS.SYNC_FILES)

const syncFilesSuccess = () => createAction(HOME_EXECUTION_MODAL_ACTION_SUCCESS, HOME_EXECUTIONS_MODALS.SYNC_FILES)

const syncFilesFailure = () => createAction(HOME_EXECUTION_MODAL_ACTION_FAILURE, HOME_EXECUTIONS_MODALS.SYNC_FILES)

export default (link) => (
  async (dispatch) => {
    dispatch(syncFilesStart())

    try {
      const { status, payload } = await API.patchApiCall(link)

      if (status === httpStatusCodes.OK) {
        const message = payload.message

        dispatch(syncFilesSuccess())

        if (message) {
          if (message.type === 'success') {
            dispatch(showAlertAboveAllSuccess({ message: message.text }))
          } else if (message.type === 'warning') {
            dispatch(showAlertAboveAllWarning({ message: message.text }))
          }
        }
      } else {
        dispatch(syncFilesFailure())
        if (payload?.error) {
          dispatch(showAlertAboveAll({ message: payload.error.message }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Unknown error response' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Error requesting worktation file sync' }))
    }
  }
)