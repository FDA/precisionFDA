import httpStatusCodes from 'http-status-codes'
import sparkMD5 from 'spark-md5'
import { closeFile, createFile, getUploadURL, uploadChunk } from '../../../../../api/files'
// import { closeFile, createFile, getUploadURL, uploadChunk } from "../../files.api"
import { CHUNK_SIZE, FilesMeta, FILE_STATUS, IUploadFile, IUploadInfo } from "./constants"

const filterFiles = (filesBlob: any[], filesMeta: any[]) =>
  filesBlob.filter(b => {
    const fileMeta = filesMeta.find(f => f.id === b.generatedId)

    if (fileMeta?.status === FILE_STATUS['added']) {
      return true
    }
  })

const throwIfError = (status: number) => {
  if (status !== httpStatusCodes.OK) {
    throw new Error('Upload failure')
  }
}

interface IMultiFileUpload {
  filesBlob: any[],
  filesMeta: FilesMeta[],
  updateFileStatus: (info: IUploadInfo) => void,
  spaceId?: number,
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
    let uploadInfo: IUploadInfo = {
      id: file.generatedId,
      status: FILE_STATUS['preparing'],
      uploadedSize: 0,
    }

    updateFileStatus(uploadInfo)

    // const createdFile = await createFile(file.name, scopeToUpload, folderId ?? null)

    await createFile(file.name, scopeToUpload, folderId ?? null)
      .then(response => {
        console.log(file.name);

        throwIfError(response.status)

        const numChunks = Math.ceil(file.size / CHUNK_SIZE)
        const reader = new FileReader()
        const spark = new sparkMD5.ArrayBuffer()
        const fileUid = response.payload.id

        reader.onload = () => {
          uploadInfo.status = FILE_STATUS['uploading']
          uploadInfo.uploadedSize = 0
          updateFileStatus(uploadInfo)

          for (let i = 0; i < numChunks; i++) {
            let firstByte = i * CHUNK_SIZE
            let lastByte = (i + 1) * CHUNK_SIZE
            if (reader.result) {
              let buffer = reader.result.slice(firstByte, lastByte) as ArrayBuffer
              spark.append(buffer)
              let hash = spark.end()

              getUploadURL(response.payload.id, i + 1, buffer.byteLength, hash)
                .then(response => {
                  const { status, payload } = response
                  const { url, headers } = payload

                  throwIfError(status)

                  return uploadChunk(url, buffer, headers)
                })
                .then(response => {
                  throwIfError(response.status)

                  uploadInfo.status = FILE_STATUS['uploading']
                  uploadInfo.uploadedSize += buffer.byteLength
                  updateFileStatus(uploadInfo)

                  if (uploadInfo.uploadedSize === file.size) {
                    uploadInfo.status = FILE_STATUS['finalizing']
                    updateFileStatus(uploadInfo)

                    return closeFile(fileUid)
                  }
                })
                .then(response => {
                  throwIfError(response!.status)

                  if (uploadInfo.uploadedSize !== file.size) return

                  uploadInfo.status = FILE_STATUS['uploaded']
                  updateFileStatus(uploadInfo)
                })
                .catch(() => {
                  uploadInfo.status = FILE_STATUS['failure']
                  updateFileStatus(uploadInfo)
                })
            }
          }

        }

        reader.readAsArrayBuffer(file as any)
      })
      .catch(() => {
        uploadInfo.status = FILE_STATUS['failure']
        // dispatch(updateFile(uploadInfo))
      })
  }
}

