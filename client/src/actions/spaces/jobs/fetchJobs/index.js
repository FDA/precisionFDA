import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToJob } from '../../../../views/shapes/JobShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  SPACE_JOBS_FETCH_START,
  SPACE_JOBS_FETCH_SUCCESS,
  SPACE_JOBS_FETCH_FAILURE,
} from '../../types'
import {
  spaceJobsListSortTypeSelector,
  spaceJobsListSortDirectionSelector,
  spaceJobsListPaginationSelector,
} from '../../../../reducers/spaces/jobs/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchJobsStart = () => createAction(SPACE_JOBS_FETCH_START)

const fetchJobsSuccess = (jobs, pagination) =>
  createAction(SPACE_JOBS_FETCH_SUCCESS, { jobs, pagination })

const fetchJobsFailure = () => createAction(SPACE_JOBS_FETCH_FAILURE)

export default (spaceId) => (
  (dispatch, getState) => {
    const sortType = spaceJobsListSortTypeSelector(getState())
    const sortDir = spaceJobsListSortDirectionSelector(getState())
    const { currentPage } = spaceJobsListPaginationSelector(getState())

    let params = {}

    if (sortType) {
      params = { order_by: sortType, order_dir: sortDir }
    }
    if (currentPage) params.page = currentPage

    dispatch(fetchJobsStart())

    return API.getJobs(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const jobs = response.payload.jobs.map(mapToJob)
          const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

          dispatch(fetchJobsSuccess(jobs, pagination))
        } else {
          dispatch(fetchJobsFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
