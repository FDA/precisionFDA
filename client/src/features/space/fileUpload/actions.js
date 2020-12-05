import httpStatusCodes from 'http-status-codes'
import sparkMD5 from 'spark-md5'
import { createAction } from '@reduxjs/toolkit'

import { CHUNK_SIZE, FILE_STATUS } from './constants'
import { closeFile, createFile, getUploadURL, uploadChunk } from '../../../api/files'
import { uploadModalFilesSelector } from './selectors'


export const showSelectResourceTypeModal = createAction('SHOW_SELECT_RESOURCE_TYPE_MODAL')
export const hideSelectResourceTypeModal = createAction('HIDE_SELECT_RESOURCE_TYPE_MODAL')

export const setResourceType = createAction('SET_RESOURCE_TYPE')

export const showUploadModal = createAction('SHOW_UPLOAD_MODAL')
export const hideUploadModal = createAction('HIDE_UPLOAD_MODAL')

export const addFile = createAction('ADD_FILE')
export const updateFile = createAction('UPDATE_FILE')
export const removeFile = createAction('REMOVE_FILE')
export const retryFile = createAction('RETRY_FILE')

export const removeAllFiles = createAction('REMOVE_ALL_FILES')

const filterFiles = (files, meta) =>
  files.filter(file => {
    const fileMeta = meta.find(entry => entry.id === file.generatedId)

    if (fileMeta?.status === FILE_STATUS.ADDED) {
      return true
    }
  })

const throwIfError = (status) => {
  if (status !== httpStatusCodes.OK) {
    throw new Error('Upload failure')
  }
}

export const uploadFiles = (files, spaceId, folderId) => (
  (dispatch, getState) => {
    const scope = `space-${spaceId}`
    const meta = uploadModalFilesSelector(getState())

    filterFiles(files, meta).forEach(file => {
      const uploadInfo = {
        id: file.generatedId,
        status: FILE_STATUS.PREPARING,
        uploadedSize: 0,
      }

      dispatch(updateFile(uploadInfo))

      createFile(file.name, scope, folderId)
        .then(response => {
          throwIfError(response.status)

          const numChunks = Math.ceil(file.size / CHUNK_SIZE)
          const reader = new FileReader()
          const spark = new sparkMD5.ArrayBuffer()
          const fileUid = response.payload.id

          reader.onload = () => {
            uploadInfo.status = FILE_STATUS.UPLOADING
            uploadInfo.uploadedSize = 0
            dispatch(updateFile(uploadInfo))

            for (let i = 0; i < numChunks; i++) {
              let firstByte = i * CHUNK_SIZE
              let lastByte = (i + 1) * CHUNK_SIZE
              let buffer = reader.result.slice(firstByte, lastByte)
              spark.append(buffer)
              let hash = spark.end()

              getUploadURL(response.payload.id, i + 1, buffer.byteLength, hash)
                .then(response => {
                  const { status, payload } = response
                  const { url, headers } = payload

                  throwIfError(status)

                  return uploadChunk(url, buffer, headers) })
                .then(response => {
                  throwIfError(response.status)

                  uploadInfo.status = FILE_STATUS.UPLOADING
                  uploadInfo.uploadedSize += buffer.byteLength
                  dispatch(updateFile(uploadInfo))

                  if (uploadInfo.uploadedSize === file.size) {
                    uploadInfo.status = FILE_STATUS.FINALIZING
                    dispatch(updateFile(uploadInfo))

                    return closeFile(fileUid)
                  } })
                .then(response => {
                  throwIfError(response.status)

                  if (uploadInfo.uploadedSize !== file.size) return

                  uploadInfo.status = FILE_STATUS.UPLOADED
                  dispatch(updateFile(uploadInfo))
                })
                .catch(() => {
                  uploadInfo.status = FILE_STATUS.FAILURE
                  dispatch(updateFile(uploadInfo))
                })
            }
          }

          reader.readAsArrayBuffer(file)
        })
        .catch(() => {
          uploadInfo.status = FILE_STATUS.FAILURE
          dispatch(updateFile(uploadInfo))
        })
    })
  }
)
