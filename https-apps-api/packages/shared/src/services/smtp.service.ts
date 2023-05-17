import * as nodemailer from 'nodemailer'
import { errors } from '..'
import { config } from '../config'
import { SendEmailJob } from '../queue/task.input'
import { getLogger } from '../logger'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import fs from 'fs'
import path from 'path'

const log = getLogger('nodemailer-logger')

interface IEmailService {
  sendEmail: (input: SendEmailJob['payload']) => Promise<void>
}

class EmailClient implements IEmailService {
  transporter: nodemailer.Transporter

  constructor() {
    const transportConfig: SMTPTransport.Options = {
      host: config.emails.smtp.host,
      port: parseInt(config.emails.smtp.port) || 0,
      secure: true,
      auth: {
        user: config.emails.smtp.username,
        pass: config.emails.smtp.password,
      },
    }

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
    return this.transporter.sendMail(
      {
        from: config.emails.smtp.fromAddress,
        cc: [],
        to: input.to,
        subject: input.subject,
        html: input.body,
      },
      (error, info) => {
        if (info) {
          log.info({ info }, 'SMTP request successful')
        }
        if (error) {
          log.error({ error: error }, 'SendEmail failed')
          throw new errors.ServiceError('SMTP request failed', {
            code: errors.ErrorCodes.AWS_SES_SERVICE_ERROR,
            clientResponse: error.message,
            clientStatusCode: 424,
          })
        }
      },
    )
  }
}

class SaveEmailToFileClient implements IEmailService {
  constructor() {
    log.info('Email saving to file is enabled')
  }

  async sendEmail(input: SendEmailJob['payload']): Promise<void> {
    log.info('Email saving to file is started')
    const html = `
    <pre>email: ${input.to}\n
    subject: ${input.subject}\n</pre>
    ${input.body}`
    const currentDate = new Date().toJSON().slice(0, 10)
    const targetPath = path.join(
      process.cwd(),
      'test-emails',
      `test-email-${input.emailType}-${currentDate}.html`,
    )
    await fs.promises.writeFile(targetPath, html)
    log.info({ targetPath }, 'Email has been successfully saved to file')
  }
}

const emailClient = new EmailClient()
const saveEmailToFileClient = new SaveEmailToFileClient()

export { emailClient, saveEmailToFileClient, IEmailService }
