import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { mapToHomeApp } from '../../../../views/shapes/HomeAppShape'
import {
  HOME_APPS_FEATURED_FETCH_START,
  HOME_APPS_FEATURED_FETCH_SUCCESS,
  HOME_APPS_FEATURED_FETCH_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchAppsFeaturedStart = () => createAction(HOME_APPS_FEATURED_FETCH_START)

const fetchAppsFeaturedSuccess = (apps) => createAction(HOME_APPS_FEATURED_FETCH_SUCCESS, apps)

const fetchAppsFeaturedFailure = () => createAction(HOME_APPS_FEATURED_FETCH_FAILURE)

export default () => (
  async (dispatch) => {
    dispatch(fetchAppsFeaturedStart())

    try {
      const response = await API.getAppsFeatured()
      
      if (response.status === httpStatusCodes.OK) {
        const apps = response.payload.apps ? response.payload.apps.map(mapToHomeApp) : []
        dispatch(fetchAppsFeaturedSuccess(apps))
      } else {
        dispatch(fetchAppsFeaturedFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchAppsFeaturedFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)