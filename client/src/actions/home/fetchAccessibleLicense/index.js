import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/files'
import {
  HOME_FETCH_ACCESSIBLE_LICENSE_SUCCESS,
  HOME_FETCH_ACCESSIBLE_LICENSE_START,
  HOME_FETCH_ACCESSIBLE_LICENSE_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import { mapToAccessibleLicense } from '../../../views/shapes/AccessibleObjectsShape'


const fetchAccessibleLicenseStart = () => createAction(HOME_FETCH_ACCESSIBLE_LICENSE_START)

const fetchAccessibleLicenseSuccess = (license) => createAction(HOME_FETCH_ACCESSIBLE_LICENSE_SUCCESS, license)

const fetchAccessibleLicenseFailure = () => createAction(HOME_FETCH_ACCESSIBLE_LICENSE_FAILURE)

export default () => (
  async (dispatch) => {
    dispatch(fetchAccessibleLicenseStart())

    try {
      const response = await API.getApiCall('/api/list_licenses')
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        const license = response.payload.licenses.map(mapToAccessibleLicense)
        dispatch(fetchAccessibleLicenseSuccess(license))
      } else {
        dispatch(fetchAccessibleLicenseFailure())
        if (response.payload && response.payload.error) {
          const { type, message } = response.payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return statusIsOK
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
