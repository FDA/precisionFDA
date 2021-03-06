import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeFile } from '../../../../views/shapes/HomeFileShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  HOME_FILES_FETCH_START,
  HOME_FILES_FETCH_SUCCESS,
  HOME_FILES_FETCH_FAILURE,
} from '../../types'
import { setPageCounters, setInitialPageCounters } from '../../index'
import { homeFilesFiltersSelector } from '../../../../reducers/home/files/selectors'
import { HOME_FILE_TYPES } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchFilesStart = () => createAction(HOME_FILES_FETCH_START, HOME_FILE_TYPES.PRIVATE)

const fetchFilesSuccess = (files, pagination, path) => createAction(HOME_FILES_FETCH_SUCCESS, { filesType: HOME_FILE_TYPES.PRIVATE, files, pagination, path })

const fetchFilesFailure = () => createAction(HOME_FILES_FETCH_FAILURE, HOME_FILE_TYPES.PRIVATE)

export default (folderId) => (
  async (dispatch, getState) => {
    const filters = homeFilesFiltersSelector(getState())
    const { sortType, sortDirection, currentPage, fields } = filters
    const params = { page: currentPage, folder_id: folderId }
    if (sortType) {
      params.order_by = sortType
      params.order_dir = sortDirection
    }
    if (fields.size) {
      fields.forEach((val, key) => {
        if (val) params[`filters[${key}]`] = val
      })
    }

    dispatch(fetchFilesStart())

    try {
      const response = await API.getFiles(params)

      if (response.status === httpStatusCodes.OK) {
        const files = response.payload.files ? response.payload.files.map(mapToHomeFile) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}
        const path = response.payload.meta ? response.payload.meta.path : []

        if (response.payload.meta) {
          const counters = {
            files: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters))
          dispatch(setInitialPageCounters(counters))
        }

        dispatch(fetchFilesSuccess(files, pagination, path))
      } else {
        dispatch(fetchFilesFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchFilesFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
