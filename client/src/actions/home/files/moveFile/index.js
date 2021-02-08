import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import { getSubfolders, postApiCall } from '../../../../api/home'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
} from '../../../alertNotifications'
import {
  HOME_MOVE_FILE_START,
  HOME_MOVE_FILE_SUCCESS,
  HOME_MOVE_FILE_FAILURE,
  HOME_FILES_FETCH_SUBFOLDERS_SUCCESS,
} from '../../types'


const fetchSubfoldersSuccess = (folderId, nodes) => createAction(HOME_FILES_FETCH_SUBFOLDERS_SUCCESS, { folderId, nodes })

const moveFileStart = () => createAction(HOME_MOVE_FILE_START)

const moveFileSuccess = () => createAction(HOME_MOVE_FILE_SUCCESS)

const moveFileFailure = () => createAction(HOME_MOVE_FILE_FAILURE)

export const filesMove = (nodeIds, targetId, link, scope) =>
  async (dispatch) => {
    dispatch(moveFileStart())
    try {
      const data = {
        node_ids: nodeIds,
        target_id: targetId || null,
        scope,
      }

      const response = await postApiCall(link, data)
      const { status, payload } = response
      const statusIsOK = status === httpStatusCodes.OK

      if (statusIsOK) {
        dispatch(moveFileSuccess())

        if (payload.message && payload.message.type === 'success') {
          dispatch(showAlertAboveAllSuccess({ message: payload.message.text }))
        } else if (payload.message && payload.message.type === 'error') {
          dispatch(showAlertAboveAll({ message: payload.message.text }))
        } else {
          dispatch(showAlertAboveAllSuccess({ message: 'Selected items successfully moved' }))
        }
      } else {
        dispatch(moveFileFailure())
        if (status === httpStatusCodes.UNPROCESSABLE_ENTITY) {
          dispatch(showAlertAboveAll({ message: payload.error.message }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { statusIsOK, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }

export const fetchSubfolders = (folderId, scope) =>
  async (dispatch) => {
    try {
      const data = {}
      if (folderId) data.folder_id = folderId
      if (scope) data.scope = scope

      const response = await getSubfolders(data)
      const { status, payload } = response

      if (status === httpStatusCodes.OK) {
        const nodes = payload.nodes.filter(e => e.type === 'Folder')

        dispatch(fetchSubfoldersSuccess(folderId, nodes))
      } else {
        dispatch(showAlertAboveAll({ message: 'Something went wrong' }))
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong' }))
    }
  }
