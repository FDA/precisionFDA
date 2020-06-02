import { createAction } from '../../../../utils/redux'
import { SPACE_FILES_TABLE_SORT } from '../../types'
import { getOrder } from '../../../../helpers'
import {
  spaceFilesListSortTypeSelector,
  spaceFilesListSortDirectionSelector,
} from '../../../../reducers/spaces/files/selectors'


const sortFilesList = ({ type, direction }) => createAction(SPACE_FILES_TABLE_SORT, { type, direction })

export default (newSortType) => (
  (dispatch, getState) => {
    const sortType = spaceFilesListSortTypeSelector(getState())
    const sortDirection = spaceFilesListSortDirectionSelector(getState())
    const order = getOrder(sortType, newSortType, sortDirection)

    return dispatch(sortFilesList(order))
  }
)
