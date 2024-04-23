export type FileWithPreview = {
  rid: string
  file: File
  preview: string
  originalName: string
  customName: string
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'linking'
}

export interface Resource {
  id: number
  meta: null | any
  url: null | string
  user: number
  user_file: number
}
