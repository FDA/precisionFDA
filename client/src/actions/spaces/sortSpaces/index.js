import { createAction } from '../../../utils/redux'
import { SPACES_SORT_SPACES_TABLE } from '../types'
import { getOrder } from '../../../helpers'
import {
  spacesListSortTypeSelector,
  spacesListSortDirectionSelector,
} from '../../../reducers/spaces/list/selectors'


const sortSpacesList = ({ type, direction }) => createAction(SPACES_SORT_SPACES_TABLE, { type, direction })

export default (newSortType) => (
  (dispatch, getState) => {
    const sortType = spacesListSortTypeSelector(getState())
    const sortDirection = spacesListSortDirectionSelector(getState())
    const order = getOrder(sortType, newSortType, sortDirection)

    return dispatch(sortSpacesList(order))
  }
)
