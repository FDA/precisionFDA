import { createAction } from '../../../../utils/redux'
import { SPACE_WORKFLOWS_TABLE_SORT } from '../../types'
import { getOrder } from '../../../../helpers'
import {
  spaceWorkflowsListSortTypeSelector,
  spaceWorkflowsListSortDirectionSelector,
} from '../../../../reducers/spaces/workflows/selectors'


const sortWorkflowsList = ({ type, direction }) => createAction(SPACE_WORKFLOWS_TABLE_SORT, { type, direction })

export default (newSortType) => (
  (dispatch, getState) => {
    const sortType = spaceWorkflowsListSortTypeSelector(getState())
    const sortDirection = spaceWorkflowsListSortDirectionSelector(getState())
    const order = getOrder(sortType, newSortType, sortDirection)

    return dispatch(sortWorkflowsList(order))
  }
)
