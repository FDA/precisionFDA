import { createAction } from '../../utils/redux'
import { fetchChallenges } from './fetchChallenges'
import { fetchChallenge } from './fetchChallenge'
import {
  CHALLENGES_SET_PAGE,
  CHALLENGES_SET_YEAR,
  CHALLENGES_SET_TIME_STATUS,
  CHALLENGES_LIST_RESET_FILTERS,
  PROPOSE_CHALLENGE_FORM_RESET,
} from './types'


const challengesSetPage = (page) => createAction(CHALLENGES_SET_PAGE, page)
const challengesSetYear = (year) => createAction(CHALLENGES_SET_YEAR, year)
const challengesSetTimeStatus = (timeStatus) => createAction(CHALLENGES_SET_TIME_STATUS, timeStatus)
const challengesListResetFilters = () => createAction(CHALLENGES_LIST_RESET_FILTERS)

const resetProposeChallengeForm = () => createAction(PROPOSE_CHALLENGE_FORM_RESET)

export {
  fetchChallenges,
  fetchChallenge,
  challengesSetPage,
  challengesSetYear,
  challengesSetTimeStatus,
  challengesListResetFilters,
  resetProposeChallengeForm,
}
