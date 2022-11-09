import * as nodemailer from 'nodemailer'
import { errors } from '..'
import { config } from '../config'
import { SendEmailJob } from '../queue/task.input'
import { getLogger } from '../logger'

type SendEmailResponse = {
  success: string
  errors?: {
    message: string
    statusCode: string
  }
}

const log = getLogger('nodemailer-logger')

class EmailClient {
  transporter: nodemailer.Transporter

  constructor() {
    const transportConfig = {
      host: config.emails.smtp.host,
      port: config.emails.smtp.port,
      secure: true,
      auth: {
        user: config.emails.smtp.username,
        pass: config.emails.smtp.password,
      },
    }

    // Comment out the following to debug SMTP connection
    // transportConfig.auth.pass = '[masked]'
    // log.info({
    //   transportConfig,
    // }, 'Initializing SMTP transport')

    this.transporter = nodemailer.createTransport(transportConfig)
    this.transporter.verify((error, success) => {
      if (success) {
        log.info({ success }, 'SMTP connection configuration is successful')
      }
      if (error) {
        log.error({ error }, 'SMTP connection configuration failed')
      }
    })
  }

  async sendEmail(input: SendEmailJob['payload']): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    const res: SendEmailResponse = await this.transporter.sendMail({
      from: config.emails.smtp.fromAddress,
      cc: [],
      to: input.to,
      subject: input.subject,
      html: input.body,
    })
    if (res.success === 'true') {
      log.info({ res }, 'SMTP request successful')
    }
    if (res.success !== 'true') {
      log.error({ error: res.errors }, 'SendEmail failed')
      throw new errors.ServiceError('SMTP request failed', {
        code: errors.ErrorCodes.AWS_SES_SERVICE_ERROR,
        clientResponse: res.success,
        // unknown
        clientStatusCode: 400,
      })
    }
    log.info({ res }, 'SMTP request successful')
  }
}

const emailClient = new EmailClient()

export { emailClient }
