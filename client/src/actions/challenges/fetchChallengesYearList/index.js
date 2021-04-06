import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/challenges'
import {
  CHALLENGES_YEAR_LIST_FETCH_START,
  CHALLENGES_YEAR_LIST_FETCH_SUCCESS,
  CHALLENGES_YEAR_LIST_FETCH_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'


const fetchChallengesYearListStart = () => createAction(CHALLENGES_YEAR_LIST_FETCH_START)

const fetchChallengesYearListSuccess = (yearList) => createAction(CHALLENGES_YEAR_LIST_FETCH_SUCCESS, yearList)

const fetchChallengesYearListFailure = () => createAction(CHALLENGES_YEAR_LIST_FETCH_FAILURE)

const fetchChallengesYearList = () => (
  (dispatch) => {
    dispatch(fetchChallengesYearListStart())

    return API.getChallengesYearList()
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const yearList = response.payload
          dispatch(fetchChallengesYearListSuccess(yearList))
        } else {
          dispatch(fetchChallengesYearListFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading Challenges year list!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading Challenges year list!' }))
      })
  }
)

export {
  fetchChallengesYearList,
}
