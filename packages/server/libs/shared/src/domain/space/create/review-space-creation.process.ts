import { Inject, Injectable } from '@nestjs/common'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { PlatformClient } from '@shared/platform-client'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '../space.entity'
import { NotFoundError, PermissionError } from '@shared/errors'
import { UserRepository } from '@shared/domain/user/user.repository'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'

@Injectable()
export class ReviewSpaceCreationProcess extends SpaceCreationProcess {
  constructor(
    user: UserContext,
    em: SqlEntityManager,
    notificationService: SpaceNotificationService,
    taggingService: TaggingService,
    @Inject(ADMIN_PLATFORM_CLIENT) adminClient: PlatformClient,
    private readonly userRepository: UserRepository,
  ) {
    super(user, em, notificationService, taggingService, adminClient)
  }

  protected async validateInput(input: CreateSpaceDTO): Promise<void> {
    if (input.guestLeadDxuser === input.hostLeadDxuser) {
      throw new Error('Sponsor and Reviewer leads must be different users')
    }
    if (input.restrictedReviewer) {
      const hostUser = await this.userRepository.findOne({ dxuser: input.hostLeadDxuser })
      if (!hostUser.isGovUser()) {
        throw new Error(`Reviewer lead ${hostUser.dxuser} is not an FDA-associated user`)
      }
    }
  }

  protected async checkPermissions(user: User): Promise<void> {
    if (!user) {
      throw new NotFoundError(`User with ID: ${this.user.id} was not found!`)
    }
    if (!(await user.isReviewSpaceAdmin())) {
      throw new PermissionError('Only review space admins can create Review spaces')
    }
  }

  async createDbRecord(input: CreateSpaceDTO): Promise<Space> {
    const sharedSpace = input.buildEntity()
    const sponsorUser = await this.userRepository.findOne(
      { dxuser: input.guestLeadDxuser },
      {
        populate: ['organization'],
      },
    )
    sharedSpace.sponsorOrgId = sponsorUser.organization.id
    await this.em.persistAndFlush(sharedSpace)

    await this.handleTags(input, sharedSpace)

    const hostPrivateSpace = this.em.create(Space, {
      ...sharedSpace,
      id: null,
      guestProject: null,
      guestDxOrg: null,
      spaceId: sharedSpace.id,
      sponsorOrgId: null,
      spaceMemberships: [],
      spaceGroups: [],
      meta: {
        ...sharedSpace.meta,
        restricted_discussions: false,
      },
    })
    this.em.persist(hostPrivateSpace)

    const guestPrivateSpace = this.em.create(Space, {
      ...sharedSpace,
      id: null,
      hostProject: null,
      hostDxOrg: null,
      spaceId: sharedSpace.id,
      sponsorOrgId: null,
      restrictToTemplate: false,
      spaceMemberships: [],
      spaceGroups: [],
      meta: {
        ...sharedSpace.meta,
        restricted_discussions: false,
      },
    })
    this.em.persist(guestPrivateSpace)

    await this.em.populate(sharedSpace, ['confidentialSpaces'], { refresh: true })
    return sharedSpace
  }

  async buildOrgs(sharedSpace: Space): Promise<void> {
    await super.createOrgForSpace(sharedSpace.id, sharedSpace.hostDxOrg)
    await super.createOrgForSpace(sharedSpace.id, sharedSpace.guestDxOrg)
  }

  protected async inviteMembers(
    space: Space,
    leads: { host: User; guest: User },
  ): Promise<SpaceMembership[]> {
    const hostLead = leads.host
    const guestLead = leads.guest
    // invite host lead as admin on platform host org
    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.hostDxOrg,
      data: {
        invitee: `user-${hostLead.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited host lead: ${hostLead.dxuser} to host org: ${space.hostDxOrg}`)

    // invite guest lead as admin on platform host org
    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.hostDxOrg,
      data: {
        invitee: `user-${guestLead.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited guest lead: ${guestLead.dxuser} to host org: ${space.hostDxOrg}`)

    // invite host lead as admin on platform guest org
    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.guestDxOrg,
      data: {
        invitee: `user-${hostLead.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited host lead: ${hostLead.dxuser} to guest org: ${space.guestDxOrg}`)

    // invite guest lead as admin on platform guest org
    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.guestDxOrg,
      data: {
        invitee: `user-${guestLead.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited guest lead: ${guestLead.dxuser} to guest org: ${space.guestDxOrg}`)

    const hostLeadMembership = new SpaceMembership(
      hostLead,
      space,
      SPACE_MEMBERSHIP_SIDE.HOST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )
    const guestLeadMembership = new SpaceMembership(
      guestLead,
      space,
      SPACE_MEMBERSHIP_SIDE.GUEST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )
    const hostLeadPrivateMembership = new SpaceMembership(
      hostLead,
      space.confidentialReviewerSpace,
      SPACE_MEMBERSHIP_SIDE.HOST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )
    const guestLeadPrivateMembership = new SpaceMembership(
      guestLead,
      space.confidentialSponsorSpace,
      SPACE_MEMBERSHIP_SIDE.GUEST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )

    this.em.persist([
      hostLeadMembership,
      guestLeadMembership,
      hostLeadPrivateMembership,
      guestLeadPrivateMembership,
    ])

    return [hostLeadMembership, guestLeadMembership]
  }

  async buildProjects(sharedSpace: Space, leads: SpaceMembership[]): Promise<void> {
    const hostLead = leads[0]
    const guestLead = leads[1]

    await this.em.populate([hostLead, guestLead], ['user.organization'])

    const hostProject = await this.adminClient.projectCreate(
      `precisionfda-${sharedSpace.scope}-HOST`,
      hostLead.user.getEntity().billTo(),
    )
    this.logger.log(
      `created host project: ${hostProject.id} with lead: ${hostLead.user.getProperty('dxuser')}`,
    )

    const guestProject = await this.adminClient.projectCreate(
      `precisionfda-${sharedSpace.scope}-GUEST`,
      guestLead.user.getEntity().billTo(),
    )
    this.logger.log(
      `created guest project: ${guestProject.id} with lead: ${guestLead.user.getProperty('dxuser')}`,
    )

    const hostPrivateProject = await this.adminClient.projectCreate(
      `precisionfda-${sharedSpace.scope}-REVIEWER-PRIVATE`,
      hostLead.user.getEntity().billTo(),
    )
    this.logger.log(`created host private project: ${hostPrivateProject.id}`)

    const guestPrivateProject = await this.adminClient.projectCreate(
      `precisionfda-${sharedSpace.scope}-SPONSOR-PRIVATE`,
      guestLead.user.getEntity().billTo(),
    )
    this.logger.log(`created guest private project: ${guestPrivateProject.id}`)

    // we could do two parallel calls to each project,
    // but not to the same one - you will get cannot acquire lock error from platform
    await this.adminClient.projectInvite(hostProject.id, sharedSpace.hostDxOrg, 'CONTRIBUTE')
    this.logger.log(`invited host org: ${sharedSpace.hostDxOrg} to host project: ${hostProject.id}`)

    await this.adminClient.projectInvite(hostProject.id, sharedSpace.guestDxOrg, 'CONTRIBUTE')
    this.logger.log(
      `invited guest org: ${sharedSpace.guestDxOrg} to host project: ${hostProject.id}`,
    )

    await this.adminClient.projectInvite(guestProject.id, sharedSpace.hostDxOrg, 'CONTRIBUTE')
    this.logger.log(
      `invited host org: ${sharedSpace.hostDxOrg} to guest project: ${guestProject.id}`,
    )

    await this.adminClient.projectInvite(guestProject.id, sharedSpace.guestDxOrg, 'CONTRIBUTE')
    this.logger.log(
      `invited guest org: ${sharedSpace.guestDxOrg} to guest project: ${guestProject.id}`,
    )

    await this.adminClient.projectInvite(hostPrivateProject.id, sharedSpace.hostDxOrg, 'CONTRIBUTE')
    this.logger.log(
      `invited host org: ${sharedSpace.hostDxOrg} to host private project: ${hostPrivateProject.id}`,
    )

    await this.adminClient.projectInvite(
      guestPrivateProject.id,
      sharedSpace.guestDxOrg,
      'CONTRIBUTE',
    )
    this.logger.log(
      `invited guest org: ${sharedSpace.guestDxOrg} to guest private project: ${guestPrivateProject.id}`,
    )

    const guestPrivateSpace = sharedSpace.confidentialSponsorSpace
    const hostPrivateSpace = sharedSpace.confidentialReviewerSpace

    sharedSpace.hostProject = hostProject.id
    sharedSpace.guestProject = guestProject.id
    guestPrivateSpace.guestProject = guestPrivateProject.id
    hostPrivateSpace.hostProject = hostPrivateProject.id
    this.em.persist(sharedSpace)
    this.em.persist(guestPrivateSpace)
    this.em.persist(hostPrivateSpace)
  }
}
