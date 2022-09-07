import httpStatusCodes from 'http-status-codes'

import * as API from '../../../api/challenges'
import { createAction } from '../../../utils/redux'
import {
  PROPOSE_CHALLENGE_FETCH_START,
  PROPOSE_CHALLENGE_FETCH_SUCCESS,
  PROPOSE_CHALLENGE_FETCH_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../alertNotifications'


const proposeChallengeStart = () => createAction(PROPOSE_CHALLENGE_FETCH_START)

const proposeChallengeSuccess = () => createAction(PROPOSE_CHALLENGE_FETCH_SUCCESS)

const proposeChallengeFailure = () => createAction(PROPOSE_CHALLENGE_FETCH_FAILURE)

const proposeChallenge = (params) => (
  (dispatch) => {
    dispatch(proposeChallengeStart())

    return API.proposeChallenge(params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          dispatch(proposeChallengeSuccess())
          dispatch(showAlertAboveAllSuccess({ message: 'Your challenge proposal has been received.' }))
        } else {
          dispatch(proposeChallengeFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong submitting your challenge proposal.' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong submitting your challenge proposal.' }))
      })
  }
)

export {
  proposeChallenge,
}
