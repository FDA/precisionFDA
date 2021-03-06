import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToHomeFile } from '../../../../views/shapes/HomeFileShape'
import * as API from '../../../../api/home'
import {
  HOME_FILES_FETCH_FILE_DETAILS_START,
  HOME_FILES_FETCH_FILE_DETAILS_SUCCESS,
  HOME_FILES_FETCH_FILE_DETAILS_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchFileDetailsStart = () => createAction(HOME_FILES_FETCH_FILE_DETAILS_START)

const fetchFileDetailsSuccess = (file, meta) => createAction(HOME_FILES_FETCH_FILE_DETAILS_SUCCESS, { file, meta })

const fetchFileDetailsFailure = () => createAction(HOME_FILES_FETCH_FILE_DETAILS_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchFileDetailsStart())

    try {
      const response = await API.getFileDetails(uid)
      if (response.status === httpStatusCodes.OK) {
        const file = mapToHomeFile(response.payload.files)
        const meta = response.payload.meta

        dispatch(fetchFileDetailsSuccess(file, meta))
      } else {
        dispatch(fetchFileDetailsFailure())
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }
    } catch (e) {
      console.error(e)
      dispatch(fetchFileDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
