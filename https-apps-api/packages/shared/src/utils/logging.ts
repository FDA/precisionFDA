import { AxiosRequestConfig } from 'axios'
import { path } from 'ramda'
import { config } from '../config'

type Payload = {
  id?: number
  dxuser?: string
  accessToken?: string
}

const maskAccessTokenUserCtx = (userCtx: Payload): Payload | null => {
  if (!userCtx) {
    return null
  }
  if (!config.logs.maskSensitive) {
    return userCtx
  }
  // nothing to mask, we are done
  if (!userCtx.accessToken) {
    return userCtx
  }
  const dataCopy = { ...userCtx }
  if (dataCopy.accessToken) {
    dataCopy.accessToken = '[masked]'
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
