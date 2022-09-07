import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToHomeDatabase } from '../../../../views/shapes/HomeDatabaseShape'
import * as API from '../../../../api/home'
import {
  HOME_DATABASES_FETCH_DETAILS_START,
  HOME_DATABASES_FETCH_DETAILS_SUCCESS,
  HOME_DATABASES_FETCH_DETAILS_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchDatabaseDetailsStart = () => createAction(HOME_DATABASES_FETCH_DETAILS_START)

const fetchDatabaseDetailsSuccess = (database, meta) => createAction(HOME_DATABASES_FETCH_DETAILS_SUCCESS, { database, meta })

const fetchDatabaseDetailsFailure = () => createAction(HOME_DATABASES_FETCH_DETAILS_FAILURE)

export default (dxid) => (
  async (dispatch) => {
    dispatch(fetchDatabaseDetailsStart())

    try {
      const { status, payload } = await API.getDatabaseDetails(dxid)
      if (status === httpStatusCodes.OK) {
        const database = mapToHomeDatabase(payload.db_cluster)
        const meta = payload.meta

        dispatch(fetchDatabaseDetailsSuccess(database, meta))
      } else {
        dispatch(fetchDatabaseDetailsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAllSuccess({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong! Wrong response status.' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(fetchDatabaseDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong! Action error.' }))
    }
  }
)
