import { createAction } from '../../utils/redux'
import { fetchChallenges } from './fetchChallenges'
import { fetchChallengesYearList } from './fetchChallengesYearList'
import { fetchChallenge } from './fetchChallenge'
import {
  CHALLENGES_SET_PAGE,
  CHALLENGES_SET_YEAR,
  CHALLENGES_LIST_RESET_FILTERS,
} from './types'


const challengesSetPage = (page) => createAction(CHALLENGES_SET_PAGE, page)
const challengesSetYear = (year) => createAction(CHALLENGES_SET_YEAR, year)
const challengesListResetFilters = () => createAction(CHALLENGES_LIST_RESET_FILTERS)

export {
  fetchChallenges,
  fetchChallengesYearList,
  fetchChallenge,
  challengesSetPage,
  challengesSetYear,
  challengesListResetFilters,
}
