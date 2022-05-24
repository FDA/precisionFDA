import { client } from '@pfda/https-apps-shared'


export const createPlatformError = (statusCode: number, type: string, message: string) => {
  return {
    response: {
      status: statusCode,
      headers: [],
      data: {
        error: {
          type: type,
          message: message,
        }
      }
    }
  }
}

// An example of a regular platform error
export const createPermissionsDeniedError = () => {
  return createPlatformError(
    401,
    client.PlatformErrors.PermissionDenied,
    'BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable',
  )
}

// From time to time we get this error from platform's nginx
export const createServiceUnavailableError = () => {
  return {
    response: {
      status: 503,
      headers: [],
      data: {
        error: {
          type: 'ServiceUnavailable',
          message: 'Some resource was temporarily unavailable; please try again later',
        }
      }
    }
  }
}

// A 504 error we sometimes encounter
export const createGatewayError = () => {
  return {
    response: {
      status: 504,
      headers: [],
      data: '<html>\r\n<head><title>504 Gateway Time-out</title></head></html>\r\n',
    }
  }
}

// ETIMEOUT error
export const createETIMEOUTError = () => {
  return {
    message: 'connect ETIMEDOUT 192.168.119.135:443',
    name: 'Error',
    stack: 'Error: connect ETIMEDOUT 192.168.119.135:443\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1144:16)',
    code: 'ETIMEDOUT',
  }
}
