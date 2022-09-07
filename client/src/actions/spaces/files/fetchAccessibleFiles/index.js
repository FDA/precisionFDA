import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/files'
import {
  FETCH_ACCESSIBLE_FILES_START,
  FETCH_ACCESSIBLE_FILES_SUCCESS,
  FETCH_ACCESSIBLE_FILES_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'
import { mapToAccessibleFile } from '../../../../views/shapes/AccessibleObjectsShape'
import { contextLinksSelector } from '../../../../reducers/context/selectors'


const fetchAccessibleFilesStart = () => createAction(FETCH_ACCESSIBLE_FILES_START)

const fetchAccessibleFilesSuccess = (files) => createAction(FETCH_ACCESSIBLE_FILES_SUCCESS, files)

const fetchAccessibleFilesFailure = () => createAction(FETCH_ACCESSIBLE_FILES_FAILURE)

export default () => (
  async (dispatch, getState) => {
    const state = getState()
    const links = contextLinksSelector(state)
    const scopes = [] //['private']

    dispatch(fetchAccessibleFilesStart())
    try {
      const response = await API.postApiCall(links.accessible_files, { scopes })
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        const files = response.payload.map(mapToAccessibleFile)
        dispatch(fetchAccessibleFilesSuccess(files))
      } else {
        dispatch(fetchAccessibleFilesFailure())
        if (response.payload && response.payload.error) {
          const { type, message } = response.payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return statusIsOK
    } catch (e)  {
      console.error(e)
    dispatch(fetchAccessibleFilesFailure())

    dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
