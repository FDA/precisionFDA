import { Inject, Logger } from '@nestjs/common'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { PlatformClient } from '@shared/platform-client'
import { UserRepository } from '@shared/domain/user/user.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DNANEXUS_INVALID_EMAIL, ORG_EVERYONE } from '@shared/config/consts'
import { Resource, User, USER_STATE } from '@shared/domain/user/user.entity'
import { ValidationError } from '@shared/errors'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserPaginationDto } from '@shared/domain/user/dto/user-pagination.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'

export class UserManagementService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly userRepo: UserRepository,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {}

  async unlockUserAccount(userId: number): Promise<void> {
    this.logger.log(`Unlocking user account for user ID: ${userId}`)
    const user = await this.userRepo.findOneOrFail({ id: userId })

    await this.adminClient.userUnlock({
      dxid: user.dxid,
      data: {
        user_id: user.dxuser,
        org_id: ORG_EVERYONE,
      },
    })
  }

  async resendActivationEmail(userId: number): Promise<void> {
    this.logger.log(`Resending activation email for user ID: ${userId}`)
    const user = await this.userRepo.findOneOrFail({ id: userId })

    if (user.privateFilesProject !== null) {
      throw new ValidationError('Cannot resend activation email to activated users')
    }

    await this.adminClient.resendActivationEmail(user.dxid)
  }

  async resetUserMfa(userId: number): Promise<void> {
    this.logger.log(`Resetting MFA for user ID: ${userId}`)
    const user = await this.userRepo.findOneOrFail({ id: userId })

    await this.adminClient.userResetMfa({
      dxid: user.dxid,
      data: {
        user_id: user.dxuser,
        org_id: ORG_EVERYONE,
      },
    })
  }

  async bulkUpdateTotalLimit(ids: number[], totalLimit: number): Promise<void> {
    this.logger.log(`Bulk updating total limit to ${totalLimit} for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkUpdateSetTotalLimit(ids, totalLimit)
  }

  async bulkUpdateJobLimit(ids: number[], jobLimit: number): Promise<void> {
    this.logger.log(`Bulk updating job limit to ${jobLimit} for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkUpdateSetJobLimit(ids, jobLimit)
  }

  async paginatePendingUsers(query: UserPaginationDto): Promise<PaginatedResult<User>> {
    this.logger.log(`Paginating pending users with query: ${JSON.stringify(query)}`)
    return await this.userRepo.paginate(query, { privateFilesProject: null })
  }

  async activateUsers(ids: number[]): Promise<void> {
    this.logger.log(`Bulk enabling users for user IDs: ${ids.join(', ')}`)
    // validate that user is not trying to activate themselves
    if (ids.includes(this.user.id)) {
      throw new ValidationError('Cannot activate self')
    }

    const users = await this.userRepo.find({
      id: {
        $in: ids,
      },
    })
    const invalidUsers = users.filter((user) => user.userState !== USER_STATE.DEACTIVATED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(
        `Cannot activate other than deactivated users: ${invalidUsers.map((user) => user.dxuser).join(', ')}`,
      )
    }

    await this.userRepo.getEntityManager().transactional(() => {
      users.forEach((user) => {
        user.disableMessage = null
        if (user.email) {
          user.email = Buffer.from(
            user.email.replace(DNANEXUS_INVALID_EMAIL, '\n'),
            'base64',
          ).toString('utf8')
        }
        if (user.normalizedEmail) {
          user.normalizedEmail = Buffer.from(
            user.normalizedEmail.replace(DNANEXUS_INVALID_EMAIL, '\n'),
            'base64',
          ).toString('utf8')
        }
        user.userState = USER_STATE.ENABLED
      })
    })
  }

  async deactivateUsers(ids: number[]): Promise<void> {
    this.logger.log(`Bulk disabling users for user IDs: ${ids.join(', ')}`)
    // validate that user is not trying to deactivate themselves
    if (ids.includes(this.user.id)) {
      throw new ValidationError('Cannot deactivate self')
    }

    const users = await this.userRepo.find({
      id: { $in: ids },
    })
    const invalidUsers = users.filter((user) => user.userState !== USER_STATE.ENABLED)
    if (invalidUsers.length > 0) {
      throw new ValidationError(
        `Cannot deactivate non-enabled users: ${invalidUsers.map((user) => user.dxuser).join(', ')}`,
      )
    }

    const encodeEmail = (email: string): string =>
      Buffer.from(email, 'utf8').toString('base64').replace('\n', '') + DNANEXUS_INVALID_EMAIL

    await this.userRepo.getEntityManager().transactional(() => {
      users.forEach((user) => {
        user.disableMessage = `Deactivated by admin: ${this.user.dxuser}`
        user.userState = USER_STATE.DEACTIVATED

        if (user.email) {
          user.email = encodeEmail(user.email)
        }
        if (user.normalizedEmail) {
          user.normalizedEmail = encodeEmail(user.normalizedEmail)
        }
      })
    })
  }

  async enableResourceType(ids: number[], resource: Resource): Promise<void> {
    this.logger.log(`Bulk enabling resource type ${resource} for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkEnableResourceType(ids, resource)
  }

  async enableAllResources(ids: number[]): Promise<void> {
    this.logger.log(`Bulk enabling all resource types for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkEnableAllResources(ids)
  }

  async disableResourceType(ids: number[], resource: Resource): Promise<void> {
    this.logger.log(`Bulk disabling resource type ${resource} for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkDisableResourceType(ids, resource)
  }

  async disableAllResources(ids: number[]): Promise<void> {
    this.logger.log(`Bulk disabling all resource types for user IDs: ${ids.join(', ')}`)
    await this.userRepo.bulkDisableAllResources(ids)
  }
}
