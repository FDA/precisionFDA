import { createAction } from '@reduxjs/toolkit'
import httpStatusCodes from 'http-status-codes'

import { getSubfolders, moveNodes } from '../../../../../api/spaces'
import { fetchFiles } from '../../../../../actions/spaces/files'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
} from '../../../../../actions/alertNotifications'
import { spaceFilesLinksSelector } from '../../../../../reducers/spaces/files/selectors'
import { processLockedSpaceForbidden } from '../../../../../utils/redux'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'


export const showMoveModal = createAction('SPACE_FILES_SHOW_MOVE_MODAL')
export const hideMoveModal = createAction('SPACE_FILES_HIDE_MOVE_MODAL')

export const fetchSubfoldersStart = createAction('SPACE_FETCH_SUBFOLDERS_START')
export const fetchSubfoldersSuccess = createAction('SPACE_FETCH_SUBFOLDERS_SUCCESS')
export const fetchSubfoldersFailure = createAction('SPACE_FETCH_SUBFOLDERS_FAILURE')

export const filesMoveStarted = createAction('SPACE_FILES_MOVE_STARTED')
export const filesMoveSuccess = createAction('SPACE_FILES_MOVE_SUCCESS')
export const filesMoveFailure = createAction('SPACE_FILES_MOVE_FAILURE')

export const filesMove = (spaceId, nodeIds, targetId, currentFolderId) => (dispatch, getState) => {
  const route = spaceFilesLinksSelector(getState()).move
  dispatch(filesMoveStarted())

  return moveNodes(route, nodeIds, targetId)
    .then(response => {
      if (response.status === httpStatusCodes.OK) {
        dispatch(filesMoveSuccess())
        dispatch(fetchFiles(spaceId, currentFolderId))
        dispatch(hideMoveModal())
        dispatch(showAlertAboveAllSuccess({ message: 'Selected items successfully moved' }))
      } else if (response.status === httpStatusCodes.UNPROCESSABLE_ENTITY) {
        dispatch(filesMoveFailure())
        dispatch(showAlertAboveAll({ message: response.payload.error.message }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        dispatch(filesMoveFailure())
        dispatch(hideMoveModal())
        processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
      }
    })
    .catch((e) => {
      console.error(e)
      dispatch(filesMoveFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong' }))
    })
}

export const fetchSubfolders = (spaceId, folderId) => dispatch => {
  dispatch(fetchSubfoldersStart())

  return getSubfolders(spaceId, folderId)
    .then(response => {
      if (response.status === httpStatusCodes.OK) {
        const { nodes } = response.payload
        dispatch(fetchSubfoldersSuccess({ folderId, nodes }))
      } else {
        fetchSubfoldersFailure()
        dispatch(showAlertAboveAll({ message: 'Something went wrong' }))
      }
    })
    .catch((e) => {
      console.error(e)
      fetchSubfoldersFailure()
      dispatch(showAlertAboveAll({ message: 'Something went wrong' }))
    })
}
