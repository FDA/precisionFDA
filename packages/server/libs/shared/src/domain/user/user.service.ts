import { FilterQuery, SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  UserInactivityAlertEmailInput,
  userInactivityAlertTemplate,
} from '@shared/domain/email/templates/mjml/user-inactivity-alert.template'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { HeaderItem } from '@shared/domain/user/header-item'
import { UserExtras } from '@shared/domain/user/user-extras'
import { CloudResourceSettings, User, USER_STATE } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NoHeaderItemsSetError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { StringUtils } from '@shared/utils/string.utils'
import { PlatformClient } from '@shared/platform-client'
import { UserCloudResourcesDTO } from '@shared/domain/user/dto/user-cloud-resources.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'

@Injectable()
export class UserService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userRepo: UserRepository,
    private readonly emailsJobProducer: EmailQueueJobProducer,
    private readonly platformClient: PlatformClient,
  ) {}

  async paginateUsers(query: UserPaginationDto): Promise<PaginatedResult<User>> {
    const where: FilterQuery<User> = {}
    if (query.filter?.dxuser) {
      where.dxuser = { $like: `%${query.filter.dxuser}%` }
    }
    if (query.filter?.email) {
      where.email = { $like: `%${query.filter.email}%` }
    }
    if (query.filter?.lastLogin) {
      const { lower, upper } = StringUtils.parseDateRange(query.filter.lastLogin)
      where.lastLogin = {
        ...(lower && { $gte: lower }),
        ...(upper && { $lte: upper }),
      }
    }
    if (query.filter?.userState) {
      where.userState = query.filter?.userState
    }

    where.cloudResourceSettings = {} as CloudResourceSettings

    if (query.filter?.totalLimit) {
      const { lower, upper } = StringUtils.parseNumberRange(query.filter.totalLimit)
      where.cloudResourceSettings = {
        ...where.cloudResourceSettings,
        total_limit: {
          ...(lower !== undefined && { $gte: lower }),
          ...(upper !== undefined && { $lte: upper }),
        },
      }
    }
    if (query.filter?.jobLimit) {
      const { lower, upper } = StringUtils.parseNumberRange(query.filter.jobLimit)
      where.cloudResourceSettings = {
        ...(where.cloudResourceSettings || {}),
        job_limit: {
          ...(lower !== undefined && { $gte: lower }),
          ...(upper !== undefined && { $lte: upper }),
        },
      }
    }

    let orderByClause = this.extractOrderByClause(query)

    return await this.userRepo.paginate(query, where, { orderBy: orderByClause })
  }

  async listActiveUserNames(): Promise<string[]> {
    this.logger.log('getting list of active user names')
    const result = await this.userRepo.findActive()
    return result.map((user) => user.dxuser)
  }

  async listGovernmentUserNames(): Promise<string[]> {
    this.logger.log('getting list of government user names')
    const result = await this.userRepo.find({
      $and: [
        { userState: 0 },
        { $or: [{ email: { $like: '%fda.hhs.gov' } }, { email: { $like: '%fda.gov' } }] },
      ],
    })
    return result.map((user) => user.dxuser)
  }

  async listHeaderItems(): Promise<HeaderItem[]> {
    this.logger.log(`Getting header items settings for user: ${this.user.dxuser}`)
    const user = await this.userRepo.findOne({ id: this.user.id })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (user.extras.header_items === undefined) {
      // TODO: PFDA-6176 Return default header items settings
      throw new NoHeaderItemsSetError(
        `Header items have not been set yet for user ${this.user.dxuser}`,
      )
    }

    return user.extras.header_items
  }

  async updateHeaderItems(headerItems: HeaderItem[]): Promise<void> {
    this.logger.log(`Updating header items settings for user: ${this.user.dxuser}`)
    const filteredHeaderItems = headerItems

    const user = await this.userRepo.findOne({ id: this.user.id })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    user.extras.header_items = filteredHeaderItems
    await this.em.flush()
  }

  /**
   * Sends inactivity alerts to users who are soon to be locked due to inactivity (55 days of inactivity, locked account at 60 days).
   * This is called by the maintenance queue processor - do not call manually.
   */
  async sendUserInactivityAlerts(): Promise<void> {
    this.logger.verbose('sending user inactivity alerts')
    const now = new Date()
    const PLATFORM_LOCKOUT_DAYS = 60
    const inactivityDateThreshold = new Date(
      now.setDate(now.getDate() - config.workerJobs.userInactivityAlert.inactiveDaysThreshold),
    )
    // find users who are close to being locked out
    const soonToBeLockedUsers = await this.userRepo.find({
      lastLogin: {
        $ne: null,
        $lt: inactivityDateThreshold,
      },
      privateFilesProject: { $ne: null },
      userState: USER_STATE.ENABLED,
    })
    // filter users who haven't been notified yet
    const usersToBeNotify = soonToBeLockedUsers.filter(
      (user) => user.extras?.inactivity_email_sent === false,
    )

    for (let i = 0; i < usersToBeNotify.length; i++) {
      const user = usersToBeNotify[i]
      await this.em.transactional(async () => {
        this.logger.log(`found soon to be locked user, sending alert to: ${user.dxuser}`)
        const today = new Date()
        const daysUntilLockout = Math.floor(
          PLATFORM_LOCKOUT_DAYS -
            (today.getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24),
        )
        const emailInput: UserInactivityAlertEmailInput = {
          receiver: user,
          daysLeft: daysUntilLockout,
        }
        const body = buildEmailTemplate<UserInactivityAlertEmailInput>(
          userInactivityAlertTemplate,
          emailInput,
        )
        const emailTask: EmailSendInput = {
          emailType: EMAIL_TYPES.userInactivityAlert,
          to: user.email,
          subject: `[precisionFDA] Your account will be locked due to inactivity in ${daysUntilLockout} days`,
          body,
        }
        await this.emailsJobProducer.createSendEmailTask(emailTask, undefined)
        // this might be null for some users, so initialize it
        user.extras ??= new UserExtras()
        user.extras.inactivity_email_sent = true
      })
    }
    // TODO - Refactor calls like ResetMFA here
  }

  async getCloudResources(): Promise<UserCloudResourcesDTO> {
    this.logger.log(`Getting cloud resources for user: ${this.user.dxuser}`)

    const user = await this.user.loadEntity()
    const org = await user.organization.load()
    const dxOrg = org.getDxOrg()
    const result = await this.platformClient.userCloudResources(dxOrg)

    return new UserCloudResourcesDTO(result, user)
  }

  // PFDA-6051 TODO Ludvik Bobek will update this to use the new pagination method
  private extractOrderByClause(query: UserPaginationDto):
    | {
        cloudResourceSettings: { total_limit: 'DESC' | 'ASC' }
      }
    | {}
    | { [p: string]: 'DESC' | 'ASC' } {
    if (['totalLimit', 'jobLimit'].includes(query.orderBy)) {
      if (query.orderBy === 'totalLimit') {
        return { cloudResourceSettings: { total_limit: query.orderDir } }
      }
      if (query.orderBy === 'jobLimit') {
        return { cloudResourceSettings: { job_limit: query.orderDir } }
      }
    } else if (query.orderBy) {
      return {
        [query.orderBy]: query.orderDir,
      }
    }
    return {}
  }
}
