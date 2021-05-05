import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/challenges'
import {
  CHALLENGES_FETCH_START,
  CHALLENGES_FETCH_SUCCESS,
  CHALLENGES_FETCH_FAILURE,
} from '../types'
import { mapToChallenge } from '../../../views/shapes/ChallengeShape'
import { mapToPagination } from '../../../views/shapes/PaginationShape'
import {
  challengesListPaginationSelector,
  challengesListYearSelector,
  challengesListTimeStatusSelector,
} from '../../../reducers/challenges/list/selectors'
import { showAlertAboveAll } from '../../alertNotifications'


const fetchChallengesStart = () => createAction(CHALLENGES_FETCH_START)

const fetchChallengesSuccess = (challenges, pagination) => createAction(CHALLENGES_FETCH_SUCCESS, { challenges, pagination })

const fetchChallengesFailure = () => createAction(CHALLENGES_FETCH_FAILURE)

const fetchChallenges = () => (
  (dispatch, getState) => {
    const state = getState()
    const pagination = challengesListPaginationSelector(state)
    let params = {}

    const year = challengesListYearSelector(state)
    if (year) {
      params = { ...params, year: year }
    }

    const timeStatus = challengesListTimeStatusSelector(state)
    if (timeStatus) {
      params = { ...params, time_status: timeStatus }
    }

    if (pagination && pagination.currentPage > 1) {
      params = { ...params, page: pagination.currentPage }
    }

    dispatch(fetchChallengesStart())

    return API.getChallenges(params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const challenges = response.payload.challenges.map(mapToChallenge)
          const pagination = mapToPagination(response.payload.meta)
          dispatch(fetchChallengesSuccess(challenges, pagination))
        } else {
          dispatch(fetchChallengesFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading Challenges!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading Challenges!' }))
      })
  }
)

export {
  fetchChallenges,
}
