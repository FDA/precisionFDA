import { createAction } from '../../../../utils/redux'
import { SPACE_APPS_TABLE_SORT } from '../../types'
import { getOrder } from '../../../../helpers'
import {
  spaceAppsListSortTypeSelector,
  spaceAppsListSortDirectionSelector,
} from '../../../../reducers/spaces/apps/selectors'


const sortAppsList = ({ type, direction }) => createAction(SPACE_APPS_TABLE_SORT, { type, direction })

export default (newSortType) => (
  (dispatch, getState) => {
    const sortType = spaceAppsListSortTypeSelector(getState())
    const sortDirection = spaceAppsListSortDirectionSelector(getState())
    const order = getOrder(sortType, newSortType, sortDirection)

    return dispatch(sortAppsList(order))
  }
)
