import { createReducer } from '@reduxjs/toolkit'
import { mergeRight, reject } from 'ramda'

import initialState from './initialState'
import {
  addFile,
  hideSelectResourceTypeModal,
  hideUploadModal,
  removeAllFiles,
  removeFile,
  retryFile,
  setResourceType,
  showSelectResourceTypeModal,
  showUploadModal,
  updateFile,
} from './actions'
import { FILE_STATUS } from './constants'


export default createReducer(initialState, {
  [showSelectResourceTypeModal]: state => {
    state.resourceType = initialState.resourceType
    state.selectResourceTypeModalShown = true
  },

  [hideSelectResourceTypeModal]: state => {
    state.selectResourceTypeModalShown = false
  },

  [setResourceType]: (state, action) => {
    state.resourceType = action.payload
  },

  [showUploadModal]: state => {
    state.uploadModalShown = true
  },

  [hideUploadModal]: state => {
    state.uploadModalShown = false
    state.uploadInProgress = false
    state.files = []
  },

  [addFile]: (state, action) => {
    if (state.files.find(file => file.id === action.payload.id)) {
      return
    }

    state.files.push(
      mergeRight(action.payload, { status: FILE_STATUS.ADDED, uploadedSize: 0 }),
    )
  },

  [updateFile]: (state, action) => {
    const { id, status, uploadedSize } = action.payload
    let existingFile = state.files.find(file => file.id === id)

    if (existingFile) {
      existingFile.status = status
      existingFile.uploadedSize = uploadedSize || 0
    }
  },

  [removeFile]: (state, action) => {
    state.files = reject(file => file.id === action.payload.id, state.files)
  },

  [retryFile]: (state, action) => {
    const { id } = action.payload
    let existingFile = state.files.find(file => file.id === id)

    if (existingFile) {
      existingFile.status = FILE_STATUS.ADDED
      existingFile.uploadedSize = 0
    }
  },

  [removeAllFiles]: state => {
    state.files = []
  },
})
