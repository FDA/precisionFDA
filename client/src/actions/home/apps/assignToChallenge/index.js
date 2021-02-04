import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_ASSIGN_TO_CHALLENGE_START,
  HOME_ASSIGN_TO_CHALLENGE_SUCCESS,
  HOME_ASSIGN_TO_CHALLENGE_FAILURE,
} from '../../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../../alertNotifications'


const assignToChallengeStart = () => createAction(HOME_ASSIGN_TO_CHALLENGE_START)

const assignToChallengeSuccess = () => createAction(HOME_ASSIGN_TO_CHALLENGE_SUCCESS)

const assignToChallengeFailure = () => createAction(HOME_ASSIGN_TO_CHALLENGE_FAILURE)

export default (link, challengeId, appId) => (
  async (dispatch) => {
    dispatch(assignToChallengeStart())

    try {
      const { status, payload } = await API.postApiCall(link, {
        id: challengeId,
        app_id: appId,
      })
      
      if (status === httpStatusCodes.OK) {
        const message = payload.message

        dispatch(assignToChallengeSuccess())

        if (message) {
          if (message.type === 'success')
            dispatch(showAlertAboveAllSuccess({ message: message.text }))
          else if (message.type === 'warning')
            dispatch(showAlertAboveAllWarning({ message: message.text }))
          else if (message.type === 'error')
            dispatch(showAlertAboveAll({ message: message.text }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Objects are successfully copied.' }))
        }
      } else {
        dispatch(assignToChallengeFailure())
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
      dispatch(assignToChallengeFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
