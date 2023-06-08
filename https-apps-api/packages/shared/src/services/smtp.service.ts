import * as nodemailer from 'nodemailer';
import { errors } from '..';
import { config } from '../config';
import { SendEmailJob } from '../queue/task.input';
import { getLogger } from '../logger';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const log = getLogger('nodemailer-logger')

class EmailClient {
  transporter: nodemailer.Transporter

  constructor() {
    const transportConfig : SMTPTransport.Options = {
      host: config.emails.smtp.host,
      port: parseInt(config.emails.smtp.port) || 0,
      secure: true,
      auth: {
        user: config.emails.smtp.username,
        pass: config.emails.smtp.password,
      },
    };

    // Comment out the following to debug SMTP connection
    // transportConfig.auth.pass = '[masked]'
    // log.info({
    //   transportConfig,
    // }, 'Initializing SMTP transport')

    this.transporter = nodemailer.createTransport(transportConfig)
    this.transporter.verify((error, success) => {
      if (success) {
        log.info({ success }, 'SMTP connection configuration is successful');
      }
      if (error) {
        log.error({ error }, 'SMTP connection configuration failed');
      }
    });
  }

  async sendEmail(input: SendEmailJob['payload']): Promise<void> {
    return await this.transporter.sendMail(
      {
        from: config.emails.smtp.fromAddress,
        cc: [],
        to: input.to,
        subject: input.subject,
        html: input.body,
      },
      (error, info) => {
        if (info) {
          log.info({ info }, 'SMTP request successful');
        }
        if (error) {
          log.error({ error: error }, 'SendEmail failed');
          throw new errors.ServiceError('SMTP request failed', {
            code: errors.ErrorCodes.AWS_SES_SERVICE_ERROR,
            clientResponse: error.message,
            clientStatusCode: 424,
          });
        }
      }
    );
  }
}

const emailClient = new EmailClient()

export { emailClient }
