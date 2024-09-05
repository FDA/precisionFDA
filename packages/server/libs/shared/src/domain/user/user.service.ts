import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { EMAIL_TYPES, EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  UserInactivityAlertEmailInput,
  userInactivityAlertTemplate,
} from '@shared/domain/email/templates/mjml/user-inactivity-alert.template'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class UserService {

  @ServiceLogger()
  private readonly logger: Logger
  private readonly userRepo: UserRepository

  constructor(
    private readonly em: SqlEntityManager,
    private readonly emailsJobProducer: EmailQueueJobProducer,
  ) {
    this.userRepo = this.em.getRepository(User)
    // PlatformAuthClient was here.
  }

  async listActiveUserNames(): Promise<string[]> {
    this.logger.log('getting list of active user names')
    const result = await this.userRepo.findActive()
    return result.map(user => user.dxuser)
  }

  async listGovernmentUserNames(): Promise<string[]> {
    this.logger.log('getting list of government user names')
    const result = await this.em.find(User, { $and: [{ userState: 0 }, { email: { $like: '%fda.hhs.gov' } }] })
    return result.map(user => user.dxuser)
  }

  /**
   * Sends inactivity alerts to users who are soon to be locked due to inactivity (55 days of inactivity, locked account at 60 days).
   * This is called by the maintenance queue processor - do not call manually.
   */
  async sendUserInactivityAlerts(): Promise<void> {
    this.logger.verbose('sending user inactivity alerts')
    const now = new Date()
    const PLATFORM_LOCKOUT_DAYS = 60
    const inactivityDateThreshold = new Date(now.setDate(now.getDate() - config.workerJobs.userInactivityAlert.inactiveDaysThreshold))
    // find users who are close to being locked out
    const soonToBeLockedUsers = await this.userRepo.find(
      {
        lastLogin: {
          $ne: null,
          $lt: inactivityDateThreshold,
        },
        privateFilesProject: { $ne: null },
        userState: USER_STATE.ENABLED,
      },
    )
    // filter users who haven't been notified yet
    const usersToNotify = soonToBeLockedUsers.filter(user => user.extras?.inactivity_email_sent !== true)

    for (const user of usersToNotify) {
      await this.em.transactional(async em => {
        this.logger.log(`found soon to be locked user, sending alert to: ${user.dxuser}`)
        const today = new Date()
        const daysUntilLockout = Math.floor(PLATFORM_LOCKOUT_DAYS - ((today.getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)))
        const emailInput: UserInactivityAlertEmailInput = { receiver: user, daysLeft: daysUntilLockout }
        const body = buildEmailTemplate<UserInactivityAlertEmailInput>(userInactivityAlertTemplate, emailInput)
        const emailTask: EmailSendInput = {
          emailType: EMAIL_TYPES.userInactivityAlert,
          to: user.email,
          subject: `[precisionFDA] Your account will be locked due to inactivity in ${daysUntilLockout} days`,
          body,
        }
        await this.emailsJobProducer.createSendEmailTask(emailTask, undefined)
        // this might be null for some users, so initialize it
        user.extras ??= { has_seen_guidelines: false, inactivity_email_sent: false }
        user.extras.inactivity_email_sent = true
      })
    }

    // TODO - Refactor calls like ResetMFA here
  }
}
