import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/spaces'
import {
  SPACES_FETCH_START,
  SPACES_FETCH_SUCCESS,
  SPACES_FETCH_FAILURE,
} from '../types'
import * as C from '../../../constants'
import { mapToSpaceList } from '../../../views/shapes/SpaceListShape'
import { mapToPagination } from '../../../views/shapes/PaginationShape'
import {
  spacesListSortTypeSelector,
  spacesListSortDirectionSelector,
  spacesListSearchStringSelector,
  spacesListPaginationSelector,
  listViewTypeSelector,
} from '../../../reducers/spaces/list/selectors'
import { showAlertAboveAll } from '../../alertNotifications'


const fetchSpacesStart = () => createAction(SPACES_FETCH_START)

const fetchSpacesSuccess = (spaces, pagination) => createAction(SPACES_FETCH_SUCCESS, { spaces, pagination })

const fetchSpacesFailure = () => createAction(SPACES_FETCH_FAILURE)

const fetchSpaces = () => (
  (dispatch, getState) => {
    const state = getState()
    const sortType = spacesListSortTypeSelector(state)
    const direction = spacesListSortDirectionSelector(state)
    const searchString = spacesListSearchStringSelector(state)
    const pagination = spacesListPaginationSelector(state)
    const viewType = listViewTypeSelector(state)
    let params = {}

    if (searchString && searchString.length) {
      params = { query: searchString }
    }

    if (sortType && viewType === C.SPACE_TYPE_TABLE) {
      params = { ...params, order_by: sortType, order_dir: direction }
    }

    if (pagination && pagination.currentPage > 1) {
      params = { ...params, page: pagination.currentPage }
    }

    dispatch(fetchSpacesStart())

    return API.getSpaces(params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const spaces = response.payload.spaces.map(mapToSpaceList)
          const pagination = mapToPagination(response.payload.meta)
          dispatch(fetchSpacesSuccess(spaces, pagination))
        } else {
          dispatch(fetchSpacesFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)

export {
  fetchSpaces,
}
