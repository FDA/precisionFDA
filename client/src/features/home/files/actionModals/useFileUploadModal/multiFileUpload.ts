/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import 'regenerator-runtime/runtime'
import httpStatusCodes from 'http-status-codes'
import sparkMD5 from 'spark-md5'
import { closeFile, createFile, getUploadURL, uploadChunk } from '../../../../../api/files'
// import { closeFile, createFile, getUploadURL, uploadChunk } from "../../files.api"
import { CHUNK_SIZE, FilesMeta, FILE_STATUS, IUploadFile, IUploadInfo } from './constants'

const filterFiles = (filesBlob: any[], filesMeta: any[]) =>
  filesBlob.filter(b => {
    const fileMeta = filesMeta.find(f => f.id === b.generatedId)

    if (fileMeta?.status === FILE_STATUS.added) {
      return true
    }
    return false
  })

const throwIfError = (status: number, payload?: any) => {
  if (status !== httpStatusCodes.OK) {
    const errorMessage = payload?.error?.message ?? 'Unknown upload failure'
    throw new Error(errorMessage)
  }
}

interface IMultiFileUpload {
  filesBlob: any[],
  filesMeta: FilesMeta[],
  updateFileStatus: (info: IUploadInfo) => void,
  spaceId?: string,
  scope?: string,
  folderId?: string
}

export const multiFileUpload = async ({
  filesBlob,
  filesMeta,
  updateFileStatus,
  spaceId,
  scope,
  folderId }: IMultiFileUpload) => {
  const scopeToUpload = scope || `space-${spaceId}`

  const filteredFiles: IUploadFile[] = filterFiles(filesBlob, filesMeta)

  for (const file of filteredFiles) {
    const uploadInfo: IUploadInfo = {
      id: file.generatedId,
      status: FILE_STATUS.preparing,
      uploadedSize: 0,
    }

    updateFileStatus(uploadInfo)

    // const createdFile = await createFile(file.name, scopeToUpload, folderId ?? null)

    await createFile(file.name, scopeToUpload, folderId ?? null)
      .then(response => {
        console.log(file.name)

        throwIfError(response.status, response.payload)

        const numChunks = Math.ceil(file.size / CHUNK_SIZE)
        const reader = new FileReader()
        const spark = new sparkMD5.ArrayBuffer()
        const fileUid = response.payload.id

        reader.onload = () => {
          uploadInfo.status = FILE_STATUS.uploading
          uploadInfo.uploadedSize = 0
          updateFileStatus(uploadInfo)

          for (let i = 0; i < numChunks; i++) {
            const firstByte = i * CHUNK_SIZE
            const lastByte = (i + 1) * CHUNK_SIZE
            if (reader.result) {
              const buffer = reader.result.slice(firstByte, lastByte) as ArrayBuffer
              spark.append(buffer)
              const hash = spark.end()

              getUploadURL(response.payload.id, i + 1, buffer.byteLength, hash)
                .then(res => {
                  const { status, payload } = res
                  const { url, headers } = payload

                  throwIfError(status, payload)

                  return uploadChunk(url, buffer, headers)
                })
                .then(res => {
                  throwIfError(res.status)

                  uploadInfo.status = FILE_STATUS.uploading
                  uploadInfo.uploadedSize += buffer.byteLength
                  updateFileStatus(uploadInfo)

                  if (uploadInfo.uploadedSize === file.size) {
                    uploadInfo.status = FILE_STATUS.finalizing
                    updateFileStatus(uploadInfo)

                    return closeFile(fileUid)
                  }
                })
                .then(res => {
                  throwIfError(res!.status)

                  if (uploadInfo.uploadedSize !== file.size) return

                  uploadInfo.status = FILE_STATUS.uploaded
                  updateFileStatus(uploadInfo)
                })
                .catch(() => {
                  uploadInfo.status = FILE_STATUS.failure
                  updateFileStatus(uploadInfo)
                })
            }
          }

        }

        reader.readAsArrayBuffer(file as any)
      })
      .catch((error) => {
        uploadInfo.status = FILE_STATUS.failure
        // dispatch(updateFile(uploadInfo))
        // Rethrow error for consumers of this API to catch
        throw error
      })
  }
}

