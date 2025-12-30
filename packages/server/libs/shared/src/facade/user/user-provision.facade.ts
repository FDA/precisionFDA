import { Reference, SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ORG_EVERYONE } from '@shared/config/consts'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { PROVISIONING_STATE } from '@shared/domain/invitation/invitation.enum'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Organization } from '@shared/domain/org/org.entity'
import { OrgRepository } from '@shared/domain/org/org.repository'
import { constructDxOrg, getHandle } from '@shared/domain/org/org.utils'
import { Profile } from '@shared/domain/profile/profile.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
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
import { SpaceMembershipCreateFacade } from '@shared/facade/space-membership/space-membership-create.facade'
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
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly spaceMembershipCreateFacade: SpaceMembershipCreateFacade,
  ) {}

  /**
   * Provisions a user based on the provided invitation.
   * This method will create an organization, user, profile, and notification preference.
   * If the user is a government user, access to selected portals will be provisioned to the user.
   * It will also send a provisioned email if the user's email is a government email.
   * If any error occurs during the provisioning process, the invitation's state will be set to FAILED.
   *
   * @param invitationId - The ID of the invitation to provision.
   * @param spaceIds - The IDs of the spaces that should be provisioned to the user (gov users only).
   * @param invitationIds - The IDs of all invitations being processed.
   */
  async provision(
    invitationId: number,
    spaceIds: number[],
    invitationIds: number[],
  ): Promise<void> {
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
      const user = await this.storeUserData(invitation, username, orgBaseHandle, orgName)
      invitation.user = Reference.create(user)
      invitation.provisioningState = PROVISIONING_STATE.FINISHED
      await this.em.persistAndFlush(invitation)
      this.logger.log(`Provisioned user ${username} with org ${orgBaseHandle}`)

      // if email is gov email, send provision email to user
      if (isGovEmail(invitation.email)) {
        // Fire and forget - don't await, errors should not affect the main flow
        this.provideSpacesAccess(invitation, spaceIds).catch((error) => {
          this.logger.error(
            `Background space access provisioning failed for invitation ${invitationId}:`,
            error,
          )
        })
        await this.sendProvisionedEmail(invitation.firstName, invitation.email, username)
      }
      await this.createSuccessProvisionNotification()
    } catch (error) {
      // unexpected error, mark invitation as failed
      this.logger.error(`Error provisioning user: ${error.message}`, error)
      invitation.provisioningState = PROVISIONING_STATE.FAILED
      await this.em.persistAndFlush(invitation)
      await this.createFailedProvisionNotification(invitation.email)
    }
    const completedInvitations = await this.getCompletedInvitations(invitationIds)
    if (completedInvitations.length === invitationIds.length) {
      await this.createCompletedNotification(invitationIds, completedInvitations)
    }
  }

  private async provideSpacesAccess(invitation: Invitation, spaceIds: number[]): Promise<void> {
    if (spaceIds.length === 0) {
      return
    }

    try {
      const userToInvite = await this.userRepo.findOneOrFail({ id: invitation.user.id })
      this.logger.log(`Provisioning access for user: ${userToInvite.dxuser} to spaces: ${spaceIds}`)
      for (const spaceId of spaceIds) {
        this.logger.log(
          `Provisioning access to space with ID: ${spaceId} for user: ${userToInvite.dxuser}`,
        )
        await this.spaceMembershipCreateFacade.createMembership(
          spaceId,
          userToInvite.id,
          SPACE_MEMBERSHIP_SIDE.HOST,
          SPACE_MEMBERSHIP_ROLE.VIEWER,
          false,
        )
      }
    } catch (error) {
      this.logger.error(
        `Error while provisioning portals access to user (id: ${invitation.user.id}: ${error.message}`,
        error,
      )
    }
  }

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

  private async findUnusedUsername(username: string): Promise<string> {
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

  private async findUnusedOrgName(orgBaseHandle: string): Promise<string> {
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
  ): Promise<void> {
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

  private createOrg(invitation: Invitation, orgName: string, orgBaseHandle: string): Organization {
    const org = new Organization()
    org.name = orgName
    org.handle = orgBaseHandle
    org.duns = invitation.duns
    org.singular = true
    org.state = 'complete'
    return org
  }

  private createUser(invitation: Invitation, org: Organization, username: string): User {
    const user = new User(org)
    user.dxuser = username
    user.schemaVersion = CURRENT_SCHEMA_VERSION
    user.firstName = invitation.firstName
    user.lastName = invitation.lastName
    user.email = invitation.email
    user.normalizedEmail = invitation.email.toLowerCase()
    user.cloudResourceSettings = DEFAULT_CLOUD_RESOURCE_SETTINGS
    user.extras = DEFAULT_USER_EXTRAS
    return user
  }

  private createProfile(invitation: Invitation, user: User): Profile {
    const profile = new Profile()
    profile.email = invitation.email
    profile.user = Reference.create(user)
    return profile
  }

  private createNotificationPreference(user: User): NotificationPreference {
    const notificationPreference = new NotificationPreference(user)
    return notificationPreference
  }

  private async storeUserData(
    invitation: Invitation,
    username: string,
    orgBaseHandle: string,
    orgName: string,
  ): Promise<User> {
    return await this.em.transactional(async () => {
      const org = this.createOrg(invitation, orgName, orgBaseHandle)
      this.em.persist(org)
      const user = this.createUser(invitation, org, username)
      this.em.persist(user)
      org.admin = Reference.create(user)
      const profile = this.createProfile(invitation, user)
      this.em.persist(profile)
      const notificationPreference = this.createNotificationPreference(user)
      this.em.persist(notificationPreference)
      return user
    })
  }

  private async sendProvisionedEmail(
    firstName: string,
    email: string,
    username: string,
  ): Promise<void> {
    const emailInput: TypedEmailBodyDto<EMAIL_TYPES.userProvisioned> = {
      type: EMAIL_TYPES.userProvisioned,
      input: {
        firstName,
        username,
        email,
      },
      receiverUserIds: [],
    }
    await this.emailService.sendEmail(emailInput)
  }

  private async createSuccessProvisionNotification(): Promise<void> {
    await this.notificationService.createNotification({
      message: 'A provisioning task has been done',
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
      userId: this.user.id,
      sessionId: this.user.sessionId,
    })
  }

  private async createFailedProvisionNotification(email: string): Promise<void> {
    await this.notificationService.createNotification({
      message: `Provisioning failed for the email: ${email}`,
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
      userId: this.user.id,
      sessionId: this.user.sessionId,
    })
  }

  private async getCompletedInvitations(
    ids: number[],
  ): Promise<Pick<Invitation, 'provisioningState'>[]> {
    return await this.invitationRepo.find(
      {
        id: { $in: ids },
        provisioningState: { $nin: [PROVISIONING_STATE.PENDING, PROVISIONING_STATE.IN_PROGRESS] },
      },
      {
        fields: ['provisioningState'],
      },
    )
  }

  private async createCompletedNotification(
    ids: number[],
    completedInvitations: Pick<Invitation, 'provisioningState'>[],
  ): Promise<void> {
    const failedCount = completedInvitations.filter(
      (invitation) => invitation.provisioningState === PROVISIONING_STATE.FAILED,
    ).length
    await this.notificationService.createNotification({
      message: `Completed provisioning for ${getPluralizedTerm(ids.length, 'user')}, ${getPluralizedTerm(failedCount, 'task')} failed`,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.ALL_USER_PROVISIONINGS_COMPLETED,
      userId: this.user.id,
      sessionId: this.user.sessionId,
      meta: {
        linkTitle: 'View Results',
        linkUrl: `/admin/invitations/provisioning?invitations=${ids.join(',')}`,
        linkTarget: '_blank',
      },
    })
  }
}
