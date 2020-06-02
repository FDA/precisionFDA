import { createAction } from '@reduxjs/toolkit'
import httpStatusCodes from 'http-status-codes'

import { getNodes } from '../../../../api/spaces'


export const fetchNodesStart = createAction('FETCH_NODES_START')
export const fetchNodesSuccess = createAction('FETCH_NODES_SUCCESS')
export const fetchNodesFailure = createAction('FETCH_NODES_FAILURE')

export const fetchNodes = (folderId) => dispatch => {
  dispatch(fetchNodesStart())

  return getNodes(folderId)
    .then(response => {
      if (response.status === httpStatusCodes.OK) {
        const { nodes } = response.payload
        dispatch(fetchNodesSuccess({ folderId, nodes }))
      } else {
        dispatch(fetchNodesFailure())
      }
    }).catch(() => dispatch(fetchNodesFailure()))
}
