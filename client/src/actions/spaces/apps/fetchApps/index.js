import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToApp } from '../../../../views/shapes/AppShape'
import { mapToPagination } from '../../../../views/shapes/PaginationShape'
import {
  SPACE_APPS_FETCH_START,
  SPACE_APPS_FETCH_SUCCESS,
  SPACE_APPS_FETCH_FAILURE,
} from '../../types'
import {
  spaceAppsListSortTypeSelector,
  spaceAppsListSortDirectionSelector,
  spaceAppsListPaginationSelector,
} from '../../../../reducers/spaces/apps/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAppsStart = () => createAction(SPACE_APPS_FETCH_START)

const fetchAppsSuccess = (apps, links, pagination) =>
  createAction(SPACE_APPS_FETCH_SUCCESS, { apps, links, pagination })

const fetchAppsFailure = () => createAction(SPACE_APPS_FETCH_FAILURE)

export default (spaceId) => (
  (dispatch, getState) => {
    const sortType = spaceAppsListSortTypeSelector(getState())
    const sortDir = spaceAppsListSortDirectionSelector(getState())
    const { currentPage } = spaceAppsListPaginationSelector(getState())

    let params = {}

    if (sortType) {
      params = { order_by: sortType, order_dir: sortDir }
    }
    if (currentPage) params.page = currentPage

    dispatch(fetchAppsStart())

    return API.getApps(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const apps = response.payload.apps.map(mapToApp)
          const links = response.payload.meta.links
          const pagination = response.payload.meta ? mapToPagination(response.payload.meta.pagination) : {}

          dispatch(fetchAppsSuccess(apps, links, pagination))
        } else {
          dispatch(fetchAppsFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
