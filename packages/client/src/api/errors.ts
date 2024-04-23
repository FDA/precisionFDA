export interface BackendError {
  error: {
    code: string
    message: string
    statusCode: number
  }
}