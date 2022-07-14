import { errors } from '@pfda/https-apps-shared'


export const errorsFactory = {
  createServiceUnavailableError: () => new errors.ClientRequestError(
    'ServiceUnavailable',
    {
      clientResponse: 'Some resource was temporarily unavailable; please try again later',
      clientStatusCode: 503,
    },
  ),
  createClientTokenExpiredError: () => new errors.ClientRequestError(
    'InvalidAuthentication',
    {
      clientResponse: 'The supplied authentication token has expired',
      clientStatusCode: 401,
    },
  ),
}
