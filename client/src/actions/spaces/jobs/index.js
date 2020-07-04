import { createAction } from '../../../utils/redux'
import {
  SPACE_JOBS_RESET_FILTERS,
} from '../types'
import fetchJobs from './fetchJobs'
import sortJobs from './sortJobs'


const resetSpaceJobsFilters = () => createAction(SPACE_JOBS_RESET_FILTERS)

export {
  fetchJobs,
  sortJobs,
  resetSpaceJobsFilters,
}
