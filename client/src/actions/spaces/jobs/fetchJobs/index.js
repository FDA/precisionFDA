import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToJob } from '../../../../views/shapes/JobShape'
import {
  SPACE_JOBS_FETCH_START,
  SPACE_JOBS_FETCH_SUCCESS,
  SPACE_JOBS_FETCH_FAILURE,
} from '../../types'
import {
  spaceJobsListSortTypeSelector,
  spaceJobsListSortDirectionSelector,
} from '../../../../reducers/spaces/jobs/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchJobsStart = () => createAction(SPACE_JOBS_FETCH_START)

const fetchJobsSuccess = (jobs) =>
  createAction(SPACE_JOBS_FETCH_SUCCESS, { jobs })

const fetchJobsFailure = () => createAction(SPACE_JOBS_FETCH_FAILURE)

export default (spaceId) => (
  (dispatch, getState) => {
    const sortType = spaceJobsListSortTypeSelector(getState())
    const sortDir = spaceJobsListSortDirectionSelector(getState())

    let params = {}

    if (sortType) {
      params = { order_by: sortType, order_dir: sortDir }
    }

    dispatch(fetchJobsStart())

    return API.getJobs(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const jobs = response.payload.jobs.map(mapToJob)
          dispatch(fetchJobsSuccess(jobs))
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
