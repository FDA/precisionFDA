import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/home'
import {
  HOME_ASSETS_MODAL_ACTION_START,
  HOME_ASSETS_MODAL_ACTION_SUCCESS,
  HOME_ASSETS_MODAL_ACTION_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'
import { HOME_ASSETS_MODALS } from '../../../../constants'


const renameAssetStart = () => createAction(HOME_ASSETS_MODAL_ACTION_START, HOME_ASSETS_MODALS.RENAME)

const renameAssetSuccess = () => createAction(HOME_ASSETS_MODAL_ACTION_SUCCESS, HOME_ASSETS_MODALS.RENAME)

const renameAssetFailure = () => createAction(HOME_ASSETS_MODAL_ACTION_FAILURE, HOME_ASSETS_MODALS.RENAME)

export default (link, name, uid) => (
  async (dispatch) => {
    dispatch(renameAssetStart())
    try {

      const response = await API.postApiCall(link, { title: name, id: uid })
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        dispatch(renameAssetSuccess())
        if (response.payload && response.payload.message) {
          const { type, text } = response.payload.message
          if (type === 'error') dispatch(showAlertAboveAll({ message: text }))
          if (type === 'success') dispatch(showAlertAboveAllSuccess({ message: text }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Asset was successfully renamed.' }))
        }
      } else {
        dispatch(renameAssetFailure())
        if (response.payload && response.payload.message) {
          const { type, text } = response.payload.message
          if (type === 'error') dispatch(showAlertAboveAll({ message: text }))
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
