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
import { setPageCounters } from '../../index'
import { homeFilesFeaturedFiltersSelector } from '../../../../reducers/home/files/selectors'
import { HOME_FILE_TYPES } from '../../../../constants'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchFilesFeaturedStart = () => createAction(HOME_FILES_FETCH_START, HOME_FILE_TYPES.FEATURED)

const fetchFilesFeaturedSuccess = (files, pagination) => createAction(HOME_FILES_FETCH_SUCCESS, { filesType: HOME_FILE_TYPES.FEATURED, files, pagination })

const fetchFilesFeaturedFailure = () => createAction(HOME_FILES_FETCH_FAILURE, HOME_FILE_TYPES.FEATURED)

export default (folderId) => (
  async (dispatch, getState) => {
    const filters = homeFilesFeaturedFiltersSelector(getState())
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

    dispatch(fetchFilesFeaturedStart())

    try {
      const response = await API.getFilesFeatured(params)
      
      if (response.status === httpStatusCodes.OK) {
        const files = response.payload.files ? response.payload.files.map(mapToHomeFile) : []
        const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}
        
        if (response.payload.meta) {
          const counters = {
            files: response.payload.meta.count,
          }
          dispatch(setPageCounters(counters))
        }

        dispatch(fetchFilesFeaturedSuccess(files, pagination))
      } else {
        dispatch(fetchFilesFeaturedFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchFilesFeaturedFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
