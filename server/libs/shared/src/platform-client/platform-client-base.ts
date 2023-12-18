/* eslint-disable max-len */
// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import type { Logger } from 'pino'
import { errors } from '..'
import type { AnyObject } from '../types'
import { maskAuthHeader } from '../utils/logging'


// Base class for PlatformClient and PlatformAuthClient. This is currently only used for the latter
// TODO: refactor PlatformClient to use this as base class
class PlatformClientBase {
  protected log: Logger

  protected setupHeaders(accessToken: string): AnyObject {
    return { authorization: `Bearer ${accessToken}` }
  }

  protected async sendRequest(options: AxiosRequestConfig, url: string) {
    try {
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  protected logClientRequest(options: AxiosRequestConfig, url: string): void {
    const sanitized = maskAuthHeader(options.headers)
    this.log.info(
      { requestOptions: { ...options, headers: sanitized }, url },
      'PlatformClient: Running DNANexus API request',
    )
  }

  protected logClientFailed(options: AxiosRequestConfig): void {
    const sanitized = maskAuthHeader(options.headers)
    this.log.warn(
      { requestOptions: { ...options, headers: sanitized } },
      'PlatformClient Error: Failed request options',
    )
  }

  protected handleFailed(
    err: any,
    customErrorThrower?: (statusCode: number, errorType: string, errorMessage: string) => void,
  ): any {
    // response status code is NOT 2xx
    if (err.response) {
      this.log.error(
        {
          response: err.response.data,
          statusCode: err.response.status,
          resHeaders: err.response.headers,
        },
        'Error: Failed platform response',
      )

      // Error response from the platform has the following response data:
      //   "error": {
      //     "type": "PermissionDenied",
      //     "message": "BillTo for this job's project must have the \"httpsApp\" feature enabled to run this executable"
      //   }
      //
      // Howvever, there's also a class of error response where the response payload is HTML
      // See platform-client.mock.ts for more examples
      //
      const statusCode = err.response.status
      const errorType = err.response.data?.error?.type || 'Server Error'
      const errorMessage = err.response.data?.error?.message || err.response.data
      if (customErrorThrower) {
        customErrorThrower(statusCode, errorType, errorMessage)
      }
      throw new errors.ClientRequestError(
        `${errorType} (${statusCode}): ${errorMessage}`,
        {
          clientResponse: err.response.data,
          clientStatusCode: statusCode,
        },
      )
    } else if (err.request) {
      // the request was made but no response was received
      this.log.error({ err }, 'Error: Failed platform request - no response received')
    } else {
      this.log.error({ err }, 'Error: Failed platform request - different error')
    }
    // todo: handle this does not result in 500 API error
    // TODO(2): Need to consider other error types and handle them with a descriptive message
    // e.g. See ETIMEOUT error in platform-client.mock.ts
    const errorMessage = err.stack || err.message || 'Unknown error - no platform response received'
    throw new errors.ClientRequestError(
      errorMessage,
      {
        clientResponse: err.response?.data || 'No platform response',
        clientStatusCode: err.response?.status || 408,
      },
    )
  }
}

export {
  PlatformClientBase,
}
