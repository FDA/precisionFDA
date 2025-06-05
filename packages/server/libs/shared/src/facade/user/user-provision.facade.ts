import { Reference, SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ORG_EVERYONE } from '@shared/config/consts'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { PROVISIONING_STATE } from '@shared/domain/invitation/invitation.enum'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Organization } from '@shared/domain/org/org.entity'
import { OrgRepository } from '@shared/domain/org/org.repository'
import { constructDxOrg, getHandle } from '@shared/domain/org/org.utils'
import { Profile } from '@shared/domain/profile/profile.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_CLOUD_RESOURCE_SETTINGS,
  DEFAULT_USER_EXTRAS,
  User,
} from '@shared/domain/user/user.entity'
import {
  constructOrgFromUsername,
  constructUsername,
  isGovEmail,
} from '@shared/domain/user/user.helper'
import { UserRepository } from '@shared/domain/user/user.repository'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { UserCreateData } from '@shared/platform-client/platform-client.params'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { getPluralizedTerm } from '@shared/utils/format'

@Injectable()
export class UserProvisionFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly userRepo: UserRepository,
    private readonly orgRepo: OrgRepository,
    private readonly invitationRepo: InvitationRepository,
    private readonly emailPrepareService: EmailPrepareService,
    private readonly emailQueueJobProducer: EmailQueueJobProducer,
    private readonly notificationService: NotificationService,
  ) {}

  private async isUserOnPlatform(username: string): Promise<boolean> {
    try {
      await this.platformClient.userDescribe({ dxid: `user-${username}` })
      return true
    } catch (error) {
      // if user does not exist, platform always throws 404
      if (error.props.clientStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  private async isOrgOnPlatform(org: string): Promise<boolean> {
    try {
      await this.platformClient.orgDescribe({ dxid: org })
      return true
    } catch (error) {
      // if org does not exist, platform always throws 404
      if (error.props.clientStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  async findUnusedUsername(username: string): Promise<string> {
    let i = 2
    let candidate = username
    while (true) {
      const userInDB = await this.userRepo.findOne({ dxuser: candidate })
      if (!userInDB && !(await this.isUserOnPlatform(candidate))) {
        return candidate
      }
      candidate = `${username}.${i}`
      i++
    }
  }

  async findUnusedOrgName(orgBaseHandle: string): Promise<string> {
    let i = 2
    let candidate = orgBaseHandle
    while (true) {
      const orgInDB = await this.orgRepo.findOne({ handle: candidate })
      if (!orgInDB && !(await this.isOrgOnPlatform(constructDxOrg(candidate)))) {
        return candidate
      }
      candidate = `${orgBaseHandle}.${i}`
      i++
    }
  }

  private async provisionOrgOnPlatform(
    invitation: Invitation,
    username: string,
    baseHandle: string,
    orgName: string,
  ) {
    const org = constructDxOrg(baseHandle)
    const newOrg = await this.adminClient.createOrg(getHandle(org), orgName)
    await this.adminClient.updateBillingInformation(newOrg.id)

    const userParams = {
      username,
      email: invitation.email,
      first: invitation.firstName,
      last: invitation.lastName,
      billTo: ORG_EVERYONE,
    } as UserCreateData

    if (isGovEmail(invitation.email)) {
      userParams['pfdasso'] = true
    }

    await this.adminClient.createUser(userParams)
    await this.adminClient.inviteUserToOrganization({
      orgDxId: newOrg.id,
      data: {
        invitee: `user-${username}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    await this.adminClient.inviteUserToOrganization({
      orgDxId: ORG_EVERYONE,
      data: {
        invitee: `user-${username}`,
        level: 'MEMBER',
        allowBillableActivities: false,
        appAccess: true,
        projectAccess: 'VIEW',
        suppressEmailNotification: true,
      },
    })
  }

  private async createOrg(invitation: Invitation, orgName: string, orgBaseHandle: string) {
    const org = new Organization()
    org.name = orgName
    org.handle = orgBaseHandle
    org.duns = invitation.duns
    org.singular = true
    org.state = 'complete'
    this.em.persist(org)
    return org
  }

  private async createUser(
    invitation: Invitation,
    org: Organization,
    username: string,
  ): Promise<User> {
    const user = new User(org)
    user.dxuser = username
    user.schemaVersion = CURRENT_SCHEMA_VERSION
    user.firstName = invitation.firstName
    user.lastName = invitation.lastName
    user.email = invitation.email
    user.normalizedEmail = invitation.email.toLowerCase()
    user.cloudResourceSettings = DEFAULT_CLOUD_RESOURCE_SETTINGS
    user.extras = DEFAULT_USER_EXTRAS
    this.em.persist(user)
    return user
  }

  private async createProfile(invitation: Invitation, user: User) {
    const profile = new Profile()
    profile.email = invitation.email
    profile.user = Reference.create(user)
    this.em.persist(profile)
    return profile
  }

  private async createNotificationPreference(user: User) {
    const notificationPreference = new NotificationPreference(user)
    this.em.persist(notificationPreference)
    return notificationPreference
  }

  private async storeData(
    invitation: Invitation,
    username: string,
    orgBaseHandle: string,
    orgName: string,
  ) {
    return await this.em.transactional(async () => {
      const org = await this.createOrg(invitation, orgName, orgBaseHandle)
      const user = await this.createUser(invitation, org, username)
      org.admin = Reference.create(user)
      this.em.persist(org)
      await this.createProfile(invitation, user)
      await this.createNotificationPreference(user)
      invitation.user = Reference.create(user)
      invitation.provisioningState = PROVISIONING_STATE.FINISHED
    })
  }

  private async sendProvisionedEmail(firstName: string, email: string, username: string) {
    const emailInput = {
      emailTypeId: EMAIL_TYPES.userProvisioned,
      input: {
        firstName,
        username,
        email,
      },
      receiverUserIds: [],
    }
    const emails = await this.emailPrepareService.prepareEmails(emailInput)
    await this.emailQueueJobProducer.createSendEmailTask(emails[0], this.user)
  }

  private async createNotification(ids: number[]) {
    const completedCount = await this.invitationRepo.count({
      id: { $in: ids },
      provisioningState: { $nin: [PROVISIONING_STATE.PENDING, PROVISIONING_STATE.IN_PROGRESS] },
    })
    if (completedCount === ids.length) {
      await this.notificationService.createNotification({
        message: `Completed provisioning for ${getPluralizedTerm(ids.length, 'user')}`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.USER_PROVISIONING_COMPLETED,
        userId: this.user.id,
        sessionId: this.user.sessionId,
        meta: {
          linkTitle: 'View Results',
          linkUrl: `/admin/invitations`,
        },
      })
    } else {
      await this.notificationService.createNotification({
        message: `A provisioning task has been completed`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.USER_PROVISIONED,
        userId: this.user.id,
        sessionId: this.user.sessionId,
      })
    }
  }

  async provision(invitationId: number, invitationIds: number[]) {
    let invitation: Invitation
    try {
      invitation = await this.invitationRepo.findOneOrFail({
        id: invitationId,
        provisioningState: PROVISIONING_STATE.IN_PROGRESS,
      })
      const username = await this.findUnusedUsername(
        constructUsername(invitation.firstName, invitation.lastName),
      )
      const { orgName, orgBaseHandle: proposedBaseHandle } = constructOrgFromUsername(username)
      const orgBaseHandle = await this.findUnusedOrgName(proposedBaseHandle)
      await this.provisionOrgOnPlatform(invitation, username, orgBaseHandle, orgName)
      await this.storeData(invitation, username, orgBaseHandle, orgName)

      // if email is gov email, send provision email to user
      if (isGovEmail(invitation.email)) {
        await this.sendProvisionedEmail(invitation.firstName, invitation.email, username)
      }
    } catch (error) {
      // unexpected error, mark invitation as failed
      this.logger.error(`Error provisioning user: ${error.message}`, error)
      invitation.provisioningState = PROVISIONING_STATE.FAILED
      await this.em.persistAndFlush(invitation)
    }
    await this.createNotification(invitationIds)
  }
}
