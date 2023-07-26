export type FileWithPreview = {
  rid: string
  file: File
  preview: string
  originalName: string
  customName: string
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'linking'
}
