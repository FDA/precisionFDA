import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_APPS_COMPARISON_ACTION_START,
  HOME_APPS_COMPARISON_ACTION_SUCCESS,
  HOME_APPS_COMPARISON_ACTION_FAILURE,
} from '../../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../../alertNotifications'


const comparisonActionStart = () => createAction(HOME_APPS_COMPARISON_ACTION_START)

const comparisonActionSuccess = () => createAction(HOME_APPS_COMPARISON_ACTION_SUCCESS)

const comparisonActionFailure = () => createAction(HOME_APPS_COMPARISON_ACTION_FAILURE)

export default (link, dxid) => (
  async (dispatch) => {
    dispatch(comparisonActionStart())

    try {
      const { status, payload } = await API.postApiCall(link, { dxid })

      if (status === httpStatusCodes.OK) {
        const messages = payload && payload.meta ? payload.meta.messages : null

        dispatch(comparisonActionSuccess())

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning')
              dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        }
      } else {
        dispatch(comparisonActionFailure())
        if (payload && payload.error) {
          dispatch(showAlertAboveAll({ message: payload.error }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(comparisonActionFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)