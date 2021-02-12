import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/files'
import {
  HOME_FETCH_COUNTERS_SUCCESS,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import { HOME_TABS } from '../../../constants'


const fetchCountersSuccess = (counters, tab) => createAction(HOME_FETCH_COUNTERS_SUCCESS, { counters, tab })

export default (tab) => (
  async (dispatch) => {
    const scope = tab && tab !== HOME_TABS.PRIVATE ? `/${tab.toLowerCase()}` : ''

    try {
      const response = await API.getApiCall(`/api/counters${scope}`)
      const statusIsOK = response.status === httpStatusCodes.OK

      if (statusIsOK) {
        dispatch(fetchCountersSuccess(response.payload, tab))
      } else {
        if (response.payload && response.payload.error) {
          const { type, message } = response.payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return { statusIsOK }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
