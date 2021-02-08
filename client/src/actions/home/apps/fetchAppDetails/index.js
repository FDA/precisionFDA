import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToHomeApp } from '../../../../views/shapes/HomeAppShape'
import * as API from '../../../../api/home'
import {
  HOME_APPS_FETCH_APP_DETAILS_START,
  HOME_APPS_FETCH_APP_DETAILS_SUCCESS,
  HOME_APPS_FETCH_APP_DETAILS_FAILURE,
} from '../../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchAppDetailsStart = () => createAction(HOME_APPS_FETCH_APP_DETAILS_START)

const fetchAppDetailsSuccess = (app, meta) => createAction(HOME_APPS_FETCH_APP_DETAILS_SUCCESS, { app, meta })

const fetchAppDetailsFailure = () => createAction(HOME_APPS_FETCH_APP_DETAILS_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchAppDetailsStart())

    try {
      const { status, payload } = await API.getAppDetails(uid)
      if (status === httpStatusCodes.OK) {
        const app = mapToHomeApp(payload.app)
        const meta = payload.meta

        dispatch(fetchAppDetailsSuccess(app, meta))
      } else {
        dispatch(fetchAppDetailsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAllSuccess({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(fetchAppDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
