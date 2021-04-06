import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/challenges'
import {
  CHALLENGE_FETCH_START,
  CHALLENGE_FETCH_SUCCESS,
  CHALLENGE_FETCH_FAILURE,
} from '../types'
import { mapToChallenge } from '../../../views/shapes/ChallengeShape'
import { showAlertAboveAll } from '../../alertNotifications'
import { setErrorPage } from '../../../views/components/ErrorWrapper/actions'
import { ERROR_PAGES } from '../../../constants'


const fetchChallengeStart = () => createAction(CHALLENGE_FETCH_START)

const fetchChallengeSuccess = (challenge) => createAction(CHALLENGE_FETCH_SUCCESS, challenge)

const fetchChallengeFailure = (error) => createAction(CHALLENGE_FETCH_FAILURE, error)

const fetchChallenge = (challengeId) => (
  (dispatch) => {
    dispatch(fetchChallengeStart())

    return API.getChallenge(challengeId)
      .then(response => {
        if (response.status === httpStatusCodes.OK && !response.payload.error) {
          const challenge = mapToChallenge(response.payload.challenge)
          dispatch(fetchChallengeSuccess(challenge))
        } else {
          dispatch(fetchChallengeFailure(response.payload.error))

          if (response.status === httpStatusCodes.NOT_FOUND) {
            dispatch(setErrorPage(ERROR_PAGES.NOT_FOUND))
          } else {
            dispatch(showAlertAboveAll({ message: 'Something went wrong loading the Challenge!' }))
          }
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading the Challenge!' }))
      })
  }
)

export {
  fetchChallenge,
  fetchChallengeSuccess,
}
