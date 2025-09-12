export interface GetUploadURLResponse {
  url: string
  headers: HeadersInit
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
