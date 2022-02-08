import { createAction } from '../../utils/redux'
import { fetchExperts } from './fetchExperts'
import {
  EXPERTS_LIST_SET_PAGE,
  EXPERTS_LIST_SET_YEAR,
  EXPERTS_LIST_RESET_FILTERS,
  EXPERTS_SHOW_MODAL,
  EXPERTS_HIDE_MODAL,
} from './types'
import { EXPERTS_MODALS } from '../../constants'

const expertsListSetPage = (page: number) => createAction(EXPERTS_LIST_SET_PAGE, page)
const expertsListSetYear = (year: number) => createAction(EXPERTS_LIST_SET_YEAR, year)
const expertsListResetFilters = () => createAction(EXPERTS_LIST_RESET_FILTERS)

const showExpertsAskQuestionModal = () => createAction(EXPERTS_SHOW_MODAL, EXPERTS_MODALS.ASK_QUESTION)
const hideExpertsAskQuestionModal = () => createAction(EXPERTS_HIDE_MODAL, EXPERTS_MODALS.ASK_QUESTION)


export {
  fetchExperts,
  expertsListSetPage,
  expertsListSetYear,
  expertsListResetFilters,

  showExpertsAskQuestionModal,
  hideExpertsAskQuestionModal,
}
