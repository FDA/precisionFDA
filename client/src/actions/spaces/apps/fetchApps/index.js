import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToApp } from '../../../../views/shapes/AppShape'
import {
  SPACE_APPS_FETCH_START,
  SPACE_APPS_FETCH_SUCCESS,
  SPACE_APPS_FETCH_FAILURE,
} from '../../types'
import {
  spaceAppsListSortTypeSelector,
  spaceAppsListSortDirectionSelector,
} from '../../../../reducers/spaces/apps/selectors'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAppsStart = () => createAction(SPACE_APPS_FETCH_START)

const fetchAppsSuccess = (apps, links) =>
  createAction(SPACE_APPS_FETCH_SUCCESS, { apps, links })

const fetchAppsFailure = () => createAction(SPACE_APPS_FETCH_FAILURE)

export default (spaceId) => (
  (dispatch, getState) => {
    const sortType = spaceAppsListSortTypeSelector(getState())
    const sortDir = spaceAppsListSortDirectionSelector(getState())

    let params = {}

    if (sortType) {
      params = { order_by: sortType, order_dir: sortDir }
    }

    dispatch(fetchAppsStart())

    return API.getApps(spaceId, params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const apps = response.payload.apps.map(mapToApp)
          const links = response.payload.meta.links
          dispatch(fetchAppsSuccess(apps, links))
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
