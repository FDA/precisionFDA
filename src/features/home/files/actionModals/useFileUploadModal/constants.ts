export const RESOURCE_TYPE = {
  COPY: 'copy',
  UPLOAD: 'upload',
}

export const MAX_UPLOADABLE_FILES = 20

export const CHUNK_SIZE = 100 * 1024**2 // 100Mb

export const MAX_UPLOADABLE_FILE_SIZE = 5 * 1024**9 // 5Tb

export const FILE_STATUS = {
  'added': 'added',
  'preparing': 'preparing',
  'uploading': 'uploading',
  'finalizing': 'finalizing',
  'uploaded': 'uploaded',
  'failure': 'failure',
}

export type FileStatusTypes = keyof typeof FILE_STATUS

export interface FilesMeta {
  id: string
  name: string
  size: number
  uploadedSize: number
  status: FileStatusTypes
}

export interface IUploadInfo {
  id: number
  status?: string,
  uploadedSize: number,
}

export interface IUploadFile {
  generatedId: number
  name: string
  size: number
}
