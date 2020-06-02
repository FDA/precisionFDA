import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  FETCH_ACCESSIBLE_APPS_START,
  FETCH_ACCESSIBLE_APPS_SUCCESS,
  FETCH_ACCESSIBLE_APPS_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import { mapToAccessibleApp } from '../../../../views/shapes/AccessibleObjectsShape'
import { contextLinksSelector } from '../../../../reducers/context/selectors'


const fetchAccessibleAppsStart = () => createAction(FETCH_ACCESSIBLE_APPS_START)

const fetchAccessibleAppsSuccess = (apps) => createAction(FETCH_ACCESSIBLE_APPS_SUCCESS, apps)

const fetchAccessibleAppsFailure = () => createAction(FETCH_ACCESSIBLE_APPS_FAILURE)

export default () => (
  (dispatch, getState) => {
    const state = getState()
    const links = contextLinksSelector(state)
    const scopes = ['private']

    dispatch(fetchAccessibleAppsStart())
    return API.postApiCall(links.accessible_apps, { scopes })
      .then(response => {
        const statusIsOK = response.status === httpStatusCodes.OK
        if (statusIsOK) {
          const apps = response.payload.map(mapToAccessibleApp)
          dispatch(fetchAccessibleAppsSuccess(apps))
        } else {
          dispatch(fetchAccessibleAppsFailure())
          if (response.payload && response.payload.error) {
            const { type, message } = response.payload.error
            dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
          } else {
            dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
          }
        }
        return statusIsOK
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
