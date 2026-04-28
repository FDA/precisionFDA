import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios'
import { PlatformErrors } from '@shared/platform-client'

type PlatformErrorPayload = { error: { type: string; message: string } }

type PlatformAxiosError = AxiosError<PlatformErrorPayload | string>

function createAxiosError(statusCode: number, data: PlatformErrorPayload | string, code?: string): PlatformAxiosError {
  const error = new AxiosError('Platform request failed', code)

  const response: AxiosResponse<PlatformErrorPayload | string> = {
    data,
    status: statusCode,
    statusText: String(statusCode),
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }

  error.response = response

  return error
}

export const createPlatformError = (statusCode: number, type: string, message: string): PlatformAxiosError => {
  return createAxiosError(statusCode, {
    error: {
      type,
      message,
    },
  })
}

// An example of a regular platform error
export const createPermissionsDeniedError = (): PlatformAxiosError => {
  return createPlatformError(
    401,
    PlatformErrors.PermissionDenied,
    'BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable',
  )
}

// A 504 error we sometimes encounter
export const createGatewayError = (): PlatformAxiosError => {
  return createAxiosError(504, '<html>\r\n<head><title>504 Gateway Time-out</title></head></html>\r\n')
}

// ETIMEOUT error
export const createETIMEOUTError = (): PlatformAxiosError => {
  const error = new AxiosError('connect ETIMEDOUT 192.168.119.135:443', 'ETIMEDOUT')
  error.name = 'Error'
  error.stack =
    'Error: connect ETIMEDOUT 192.168.119.135:443\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16)'
  error.request = {}

  return error
}
