import { createAction } from '../../utils/redux'
import { fetchNews } from './fetchNews'
import {
  NEWS_LIST_SET_PAGE,
  NEWS_LIST_SET_YEAR,
  NEWS_LIST_RESET_FILTERS,
} from './types'

const newsListSetPage = (page: number) => createAction(NEWS_LIST_SET_PAGE, page)
const newsListSetYear = (year: number) => createAction(NEWS_LIST_SET_YEAR, year)
const newsListResetFilters = () => createAction(NEWS_LIST_RESET_FILTERS)

export {
  fetchNews,
  newsListSetPage,
  newsListSetYear,
  newsListResetFilters,
}
