export interface GetUploadURLResponse {
  url: string
  headers: {
      host: string
      'content-type': string
      'x-amz-server-side-encryption': 'AES256' | string
      'content-md5': string
      'content-length': number
  },
  expires: number
}

export interface Resource {
  id: number
  name: string
  url: string
  isDeleting?: boolean
}

export interface RemovePayload {
  portalId: string
  resourceId: number
}

export type FileWithPreview = {
  rid: string
  file: File
  preview: string
  originalName: string
  customName: string
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'linking'
}
