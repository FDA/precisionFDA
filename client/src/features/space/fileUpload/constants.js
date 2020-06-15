export const RESOURCE_TYPE = {
  COPY: 'copy',
  UPLOAD: 'upload',
}

export const MAX_UPLOADABLE_FILES = 20

export const CHUNK_SIZE = 100 * Math.pow(1024, 2) // 100Mb

export const MAX_UPLOADABLE_FILE_SIZE = 5 * Math.pow(1024, 9) // 5Tb

export const FILE_STATUS = {
  ADDED: 'added',
  PREPARING: 'preparing',
  UPLOADING: 'uploading',
  FINALIZING: 'finalizing',
  UPLOADED: 'uploaded',
  FAILURE: 'failure',
}
