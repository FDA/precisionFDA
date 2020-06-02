import { createAction } from '../../../../utils/redux'
import { SPACE_JOBS_TABLE_SORT } from '../../types'
import { getOrder } from '../../../../helpers'
import {
  spaceJobsListSortTypeSelector,
  spaceJobsListSortDirectionSelector,
} from '../../../../reducers/spaces/jobs/selectors'


const sortJobsList = ({ type, direction }) => createAction(SPACE_JOBS_TABLE_SORT, { type, direction })

export default (newSortType) => (
  (dispatch, getState) => {
    const sortType = spaceJobsListSortTypeSelector(getState())
    const sortDirection = spaceJobsListSortDirectionSelector(getState())
    const order = getOrder(sortType, newSortType, sortDirection)

    return dispatch(sortJobsList(order))
  }
)
