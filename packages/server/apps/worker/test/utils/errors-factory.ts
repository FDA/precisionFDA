import { ClientRequestError } from '@shared/errors'

export const errorsFactory = {
  createServiceUnavailableError: (): ClientRequestError =>
    new ClientRequestError('ServiceUnavailable', {
      clientResponse: 'Some resource was temporarily unavailable; please try again later',
      clientStatusCode: 503,
    }),
  createClientTokenExpiredError: (): ClientRequestError =>
    new ClientRequestError('InvalidAuthentication', {
      clientResponse: 'The supplied authentication token has expired',
      clientStatusCode: 401,
    }),
}
