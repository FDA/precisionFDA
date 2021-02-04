import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import {
  SPACE_FILES_FETCH_START,
  SPACE_FILES_FETCH_SUCCESS,
  SPACE_FILES_FETCH_FAILURE,
} from '../../types'
import { mapToFile } from '../../../../views/shapes/FileShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  spaceFilesListSortTypeSelector,
  spaceFilesListSortDirectionSelector,
  spaceFilesListPaginationSelector,
} from '../../../../reducers/spaces/files/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchFilesStart = () => createAction(SPACE_FILES_FETCH_START)

const fetchFilesSuccess = (files) => createAction(SPACE_FILES_FETCH_SUCCESS, files)

const fetchFilesFailure = () => createAction(SPACE_FILES_FETCH_FAILURE)

export default (spaceId, folderId) => (
  (dispatch, getState) => {
    const sortType = spaceFilesListSortTypeSelector(getState())
    const sortDir = spaceFilesListSortDirectionSelector(getState())
    const { currentPage } = spaceFilesListPaginationSelector(getState())

    let params = { folder_id: folderId }

    if (sortType) { params = { order_by: sortType, order_dir: sortDir, folder_id: folderId } }
    if (currentPage) params.page = currentPage

    dispatch(fetchFilesStart())

    return API.getFiles(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const files = response.payload.entries.map(mapToFile)
          const { links, path } = response.payload.meta
          const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

          dispatch(fetchFilesSuccess({ files, links, path, pagination }))
        } else {
          dispatch(fetchFilesFailure())

          if (response.status !== httpStatusCodes.NOT_FOUND) {
            dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
          }
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
