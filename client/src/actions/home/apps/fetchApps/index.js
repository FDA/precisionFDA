import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeApp } from '../../../../views/shapes/HomeAppShape'
import {
  HOME_APPS_FETCH_START,
  HOME_APPS_FETCH_SUCCESS,
  HOME_APPS_FETCH_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAppsStart = () => createAction(HOME_APPS_FETCH_START)

const fetchAppsSuccess = (apps) => createAction(HOME_APPS_FETCH_SUCCESS, apps)

const fetchAppsFailure = () => createAction(HOME_APPS_FETCH_FAILURE)

export default () => (
  async (dispatch) => {
    dispatch(fetchAppsStart())

    try {
      const response = await API.getApps()
      
      if (response.status === httpStatusCodes.OK) {
        const apps = response.payload.apps ? response.payload.apps.map(mapToHomeApp) : []
        dispatch(fetchAppsSuccess(apps))
      } else {
        dispatch(fetchAppsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchAppsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)