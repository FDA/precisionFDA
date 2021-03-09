import { createAction } from '../../../utils/redux'
import {
  SPACE_JOBS_RESET_FILTERS,
  SPACE_JOBS_SET_CURRENT_PAGE_VALUE,
} from '../types'
import fetchJobs from './fetchJobs'
import sortJobs from './sortJobs'


const resetSpaceJobsFilters = () => createAction(SPACE_JOBS_RESET_FILTERS)
const setJobsCurrentPageValue = (value) => createAction(SPACE_JOBS_SET_CURRENT_PAGE_VALUE, value)

export {
  fetchJobs,
  sortJobs,
  resetSpaceJobsFilters,
  setJobsCurrentPageValue,
}
