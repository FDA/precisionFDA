import { createAction } from '../../utils/redux'
import { fetchExperts } from './fetchExperts'
import {
  EXPERTS_LIST_SET_PAGE,
  EXPERTS_LIST_SET_YEAR,
  EXPERTS_LIST_RESET_FILTERS,
} from './types'

const expertsListSetPage = (page: number) => createAction(EXPERTS_LIST_SET_PAGE, page)
const expertsListSetYear = (year: number) => createAction(EXPERTS_LIST_SET_YEAR, year)
const expertsListResetFilters = () => createAction(EXPERTS_LIST_RESET_FILTERS)

export {
  fetchExperts,
  expertsListSetPage,
  expertsListSetYear,
  expertsListResetFilters,
}
