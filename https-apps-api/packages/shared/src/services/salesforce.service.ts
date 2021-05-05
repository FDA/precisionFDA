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
    this.connection = new jsforce.Connection({ loginUrl: config.emails.salesforce.apiUrl })
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
            ccAddresses: ['kbehalova-cf@dnanexus.com'],
            toAddresses: input.to,
            subject: input.subject,
            htmlBody: input.body,
          },
        ],
      },
      {},
    )
    if (res.success !== 'true') {
      log.error({ err: res.errors }, 'SendEmail failed')
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
