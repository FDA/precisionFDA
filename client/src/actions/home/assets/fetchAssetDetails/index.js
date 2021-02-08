import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { mapToHomeAsset } from '../../../../views/shapes/HomeAssetShape'
import * as API from '../../../../api/home'
import {
  HOME_ASSETS_FETCH_ASSET_DETAILS_START,
  HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS,
  HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE,
} from '../types'
import { showAlertAboveAll, showAlertAboveAllSuccess } from '../../../alertNotifications'


const fetchAssetDetailsStart = () => createAction(HOME_ASSETS_FETCH_ASSET_DETAILS_START)

const fetchAssetDetailsSuccess = (asset, meta) => createAction(HOME_ASSETS_FETCH_ASSET_DETAILS_SUCCESS, { asset, meta })

const fetchAssetDetailsFailure = () => createAction(HOME_ASSETS_FETCH_ASSET_DETAILS_FAILURE)

export default (uid) => (
  async (dispatch) => {
    dispatch(fetchAssetDetailsStart())

    try {
      const { status, payload } = await API.getAssetDetails(uid)
      if (status === httpStatusCodes.OK) {
        const asset = mapToHomeAsset(payload.asset)
        const meta = payload.meta

        dispatch(fetchAssetDetailsSuccess(asset, meta))
      } else {
        dispatch(fetchAssetDetailsFailure())
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
      dispatch(fetchAssetDetailsFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
