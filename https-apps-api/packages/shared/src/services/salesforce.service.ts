import * as jsforce from 'jsforce'
import { errors } from '..'
import { config } from '../config'
import { SendEmailJob } from '../queue/task.input'
import { getLogger } from '../logger'

type SoapInvokeResponse = {
  success: string
  errors?: {
    message: string
    statusCode: string
  }
}

const log = getLogger('salesforce-logger')

class EmailClient {
  connection: jsforce.Connection
  constructor() {
    const completeUrl = new URL(`https://${config.emails.salesforce.apiUrl}`)
    this.connection = new jsforce.Connection({ loginUrl: completeUrl.href })
  }

  async login(): Promise<jsforce.UserInfo> {
    try {
      const res = await this.connection.loginBySoap(
        config.emails.salesforce.username,
        `${config.emails.salesforce.password}${config.emails.salesforce.secretToken}`,
      )
      return res
    } catch (err) {
      log.error({ err }, 'Salesforce login failed')
      throw new errors.ServiceError(err.message, {
        code: errors.ErrorCodes.SALESFORCE_SERVICE_ERROR,
        clientResponse: {},
        clientStatusCode: 401,
      })
    }
  }

  async sendEmail(input: SendEmailJob['payload']): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    const res: SoapInvokeResponse = await this.connection.soap._invoke(
      'sendEmail',
      {
        messages: [
          {
            '@xsi:type': 'SingleEmailMessage',
            orgWideEmailAddressId: config.emails.salesforce.fromAddress,
            ccAddresses: [],
            toAddresses: input.to,
            subject: input.subject,
            htmlBody: input.body,
          },
        ],
      },
      {},
    )
    if (res.success !== 'true') {
      log.error({ error: res.errors }, 'SendEmail failed')
      throw new errors.ServiceError('Salesforce request failed', {
        code: errors.ErrorCodes.SALESFORCE_SERVICE_ERROR,
        clientResponse: res.success,
        // unknown
        clientStatusCode: 400,
      })
    }
    log.debug({ res }, 'Salesforce request successful')
  }
}

const emailClient = new EmailClient()

export { emailClient }
