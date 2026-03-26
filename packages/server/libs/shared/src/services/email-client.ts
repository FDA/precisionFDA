import { ErrorCodes, ServiceError } from '@shared/errors'
import * as nodemailer from 'nodemailer'
import { config } from '../config'
import { getLogger } from '../logger'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import fs from 'node:fs'
import path from 'node:path'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { randomUUID } from 'node:crypto'

const log = getLogger('nodemailer-logger')

abstract class EmailClient {
  abstract sendEmail(input: EmailSendInput): Promise<void>
}

class SMTPEmailClient extends EmailClient {
  transporter: nodemailer.Transporter

  constructor() {
    super()
    const transportConfig: SMTPTransport.Options = {
      host: config.emails.smtp.host,
      port: parseInt(config.emails.smtp.port, 10) || 0,
      secure: true,
      auth: {
        user: config.emails.smtp.username,
        pass: config.emails.smtp.password,
      },
    }

    this.transporter = nodemailer.createTransport(transportConfig)
    this.transporter.verify((error, success) => {
      if (success) {
        log.log({ success }, 'SMTP connection configuration is successful')
      }
      if (error) {
        log.error({ error }, 'SMTP connection configuration failed')
      }
    })
  }

  async sendEmail(input: EmailSendInput): Promise<void> {
    try {
      // The duplication of to is necessary
      // The top‑level to: header for the message headers (what your recipients actually see in their inbox).
      // The envelope.to: array for the underlying SMTP envelope (which is what SES uses to actually deliver).

      const info = await this.transporter.sendMail({
        from: config.emails.smtp.fromAddress,
        cc: [],
        to: input.to,
        replyTo: input.replyTo,
        subject: input.subject,
        html: input.body,
        envelope: {
          from: input.returnAddress ?? config.emails.smtp.returnAddress,
          to: [input.to],
        },
      })

      if (info) {
        log.log({ info }, 'SMTP request successful')
      }
    } catch (error) {
      log.error({ error: error }, 'SendEmail failed')
      throw new ServiceError('SMTP request failed', {
        code: ErrorCodes.AWS_SES_SERVICE_ERROR,
        clientResponse: error?.message,
        clientStatusCode: 424,
      })
    }
  }
}

class FileEmailClient extends EmailClient {
  constructor() {
    super()
    log.log('Email saving to file is enabled')
  }

  async sendEmail(input: EmailSendInput): Promise<void> {
    log.log('Email saving to file is started')
    const html = `
    <pre>email: ${input.to}\n
    subject: ${input.subject}\n</pre>
    ${input.body}`
    const currentDate = new Date().toJSON().slice(0, 19)
    const uuid = randomUUID()

    const targetPath = path.join(
      process.cwd(),
      'test-emails',
      `test-email-${input.emailType}-${input.to}-${currentDate}-${uuid}.html`,
    )
    await fs.promises.writeFile(targetPath, html)
    log.log({ targetPath }, 'Email has been successfully saved to file')
  }
}

export { EmailClient, FileEmailClient, SMTPEmailClient }
