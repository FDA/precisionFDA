import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { AxiosRequestConfig } from 'axios'
import { path } from 'ramda'
import { config } from '../config'

type Payload = {
  id?: number
  dxuser?: string
  accessToken?: string
}

const MASKED = '[masked]'

const maskAccessTokenUserCtx = <T extends Payload>(userCtx: T): T | null => {
  if (!userCtx) {
    return null
  }
  if (!config.logs.maskSensitive) {
    return userCtx
  }
  // nothing to mask, we are done
  if (!userCtx.accessToken && !userCtx[USER_CONTEXT_HTTP_HEADERS.accessToken]) {
    return userCtx
  }
  const dataCopy = { ...userCtx }
  if (dataCopy.accessToken) {
    dataCopy.accessToken = MASKED
  }
  if (dataCopy[USER_CONTEXT_HTTP_HEADERS.accessToken]) {
    dataCopy[USER_CONTEXT_HTTP_HEADERS.accessToken] = MASKED
  }
  return dataCopy
}

const maskAuthHeader = (
  headers: AxiosRequestConfig['headers'],
): AxiosRequestConfig['headers'] | null => {
  if (!headers) {
    return null
  }
  if (!config.logs.maskSensitive) {
    return headers
  }
  if (path(['authorization'], headers)) {
    const maskedHeaders = { ...headers }
    delete maskedHeaders.authorization
    return maskedHeaders
  }
  return headers
}

export { maskAccessTokenUserCtx, maskAuthHeader }
