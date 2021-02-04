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


const terminateStart = () => createAction(HOME_EXECUTION_MODAL_ACTION_START, HOME_EXECUTIONS_MODALS.TERMINATE)

const terminateSuccess = () => createAction(HOME_EXECUTION_MODAL_ACTION_SUCCESS, HOME_EXECUTIONS_MODALS.TERMINATE)

const terminateFailure = () => createAction(HOME_EXECUTION_MODAL_ACTION_FAILURE, HOME_EXECUTIONS_MODALS.TERMINATE)

export default (link, ids) => (
  async (dispatch) => {
    dispatch(terminateStart())

    try {
      const { status, payload } = await API.postApiCall(link, {
        id: ids,
      })

      if (status === httpStatusCodes.OK) {
        const message = payload.message

        dispatch(terminateSuccess())

        if (message) {
          if (message.type === 'success') {
            dispatch(showAlertAboveAllSuccess({ message: message.text }))
          } else if (message.type === 'warning') {
            dispatch(showAlertAboveAllWarning({ message: message.text }))
          }
        }
    } else {
      dispatch(terminateFailure())
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