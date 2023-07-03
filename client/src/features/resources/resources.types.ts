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
