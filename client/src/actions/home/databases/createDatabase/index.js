import history from '../../../../utils/history'
import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import {
  HOME_DATABASE_CREATE_START,
  HOME_DATABASE_CREATE_SUCCESS,
  HOME_DATABASE_CREATE_FAILURE,
} from '../types'
import { mapToHomeDatabase } from '../../../../views/shapes/HomeDatabaseShape'
import { isHttpSuccess } from '../../../../helpers'


const createDatabaseStart = () => createAction(HOME_DATABASE_CREATE_START)
const createDatabaseSuccess = () => createAction(HOME_DATABASE_CREATE_SUCCESS)
const createDatabaseFailure = () => createAction(HOME_DATABASE_CREATE_FAILURE)

export default (link, db_cluster) => (
  async (dispatch) => {
    dispatch(createDatabaseStart())
    try {
      const response = await API.postApiCall(link, { db_cluster })
      const statusIsOK = isHttpSuccess(response.status)
      if (statusIsOK) {
        const database = mapToHomeDatabase(response.payload.db_cluster)
        const redirect = database.links?.show ? `${database.dxid}` : ''

        dispatch(createDatabaseSuccess())
        dispatch(showAlertAboveAllSuccess({ message: 'The Database has been successfully created' }))

        history.push(redirect)
      } else {
        dispatch(createDatabaseFailure())
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
