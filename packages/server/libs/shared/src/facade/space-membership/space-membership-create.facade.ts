import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceEventDTO } from '@shared/domain/space-event/dto/space-event.dto'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

export class SpaceMembershipCreateFacade {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly userContext: UserContext,
    private readonly spaceEventService: SpaceEventService,
    private readonly emailService: EmailService,
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /*
   * Creates a new membership for a user in a specified space.
   * New memberships can only be created in GROUPS, GOVERNMENT and REVIEW SPACES.
   * REVIEW SPACES - requires additional checks and is not currently implemented.
   */
  async createMembership(
    spaceId: number,
    userId: number,
    side: SPACE_MEMBERSHIP_SIDE,
    role: SPACE_MEMBERSHIP_ROLE,
    sendEmailNotification: boolean = true,
  ): Promise<SpaceMembership> {
    // TODO - JIRI
    // findEditable condition differs by what you want to do in the space.
    // for files & other resources manipulation - user has to be an active lead |admin | contributor
    // but for managing memberships - use has to be an active lead | admin only.
    // currently not reflected in the repository code, but should be.
    const space = await this.spaceRepo.findEditableOne({
      id: spaceId,
      spaceMemberships: {
        role: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD],
      },
    })
    const newMemberUser = await this.userRepo.findOne({ id: userId })

    await this.runValidations(space, newMemberUser)

    await this.inviteUserToPlatformSpaceOrganizations(newMemberUser, space, side, role)

    //TODO: PFDA-6446 for review spaces, you need two memberships: one for private, one for shared space.
    return this.em.transactional(async () => {
      const spaceMembership = new SpaceMembership(newMemberUser, space, side, role)

      const spaceEvent = {
        spaceId: space.id,
        userId: newMemberUser.id,
        membership: spaceMembership,
        entity: { type: 'spaceMembership', value: { id: spaceMembership.id } },
        activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      } as SpaceEventDTO
      this.spaceMembershipRepo.persist(spaceMembership)

      if (sendEmailNotification) {
        await this.emailService.sendEmail({
          type: EMAIL_TYPES.spaceInvitation,
          input: {
            membershipId: newMemberUser.id,
            adminId: this.userContext.id,
          },
        })
        await this.spaceEventService.createAndSendSpaceEvent(spaceEvent)
      } else {
        await this.spaceEventService.createSpaceEvent(spaceEvent)
      }

      return spaceMembership
    })
  }

  async inviteUserToPlatformSpaceOrganizations(
    user: User,
    space: Space,
    side: SPACE_MEMBERSHIP_SIDE,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<void> {
    const oppositeSide = side === SPACE_MEMBERSHIP_SIDE.HOST ? SPACE_MEMBERSHIP_SIDE.GUEST : SPACE_MEMBERSHIP_SIDE.HOST

    switch (space.type) {
      case SPACE_TYPE.GROUPS:
        // invite to both host and guest orgs
        if ([SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(role)) {
          await this.inviteAsAdminOrLead(user, space, side)
          await this.inviteAsAdminOrLead(user, space, oppositeSide)
        } else if (role === SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR) {
          await this.inviteAsContributor(user, space, side)
          await this.inviteAsContributor(user, space, oppositeSide)
        } else if (role === SPACE_MEMBERSHIP_ROLE.VIEWER) {
          await this.inviteAsViewer(user, space, side)
          await this.inviteAsViewer(user, space, oppositeSide)
        }
        break

      case SPACE_TYPE.REVIEW: //TODO PFDA-6446 invite to the correct side org and the shared org
        throw new InvalidStateError('Creating memberships for review spaces is not supported yet')

      default:
        throw new InvalidStateError(`Unsupported space type: ${space.type}`)
    }
  }

  private async runValidations(space: Space, newMemberUser: User): Promise<void> {
    if (!space) {
      throw new InvalidStateError(`Target space was not found or is not accessible`)
    }
    if (space.state !== SPACE_STATE.ACTIVE) {
      throw new InvalidStateError(`You cannot create membership for non-active space`)
    }
    if (space.type === SPACE_TYPE.REVIEW) {
      // TODO PFDA-6446  unsupported for now
      throw new InvalidStateError('Creating memberships for review spaces is not supported yet')
    }
    if (space.type === SPACE_TYPE.PRIVATE_TYPE) {
      throw new InvalidStateError('You cannot create new memberships for private space')
    }

    if (space.type === SPACE_TYPE.ADMINISTRATOR) {
      // TODO PFDA-6446 - the error message is not exactly correct - it should work but not from the UI / endpoint
      // when called from the UI- it should throw validation error but should work while new admin is added, or new admin space created.
      throw new InvalidStateError(
        'You cannot create new memberships for administrator space, access is managed automatically',
      )
    }

    if (space.type === SPACE_TYPE.VERIFICATION) {
      throw new InvalidStateError('You cannot create new memberships for verification space - DEPRECATED')
    }

    if (space.type === SPACE_TYPE.GOVERNMENT) {
      // TODO PFDA-6446
      throw new InvalidStateError('Creating memberships for government spaces is not supported yet')
    }

    //TODO: PFDA-6446 for review spaces, you have to check if the user is not member of the other side already
    const existingMembership = await this.spaceMembershipRepo.findOne({
      spaces: space,
      user: newMemberUser,
    })

    if (existingMembership) {
      throw new InvalidStateError(`User ${newMemberUser.dxuser} is already a member of space ${space.name}`)
    }
  }

  private async inviteAsAdminOrLead(user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE): Promise<void> {
    await this.adminClient.inviteUserToOrganization({
      orgDxId: side === SPACE_MEMBERSHIP_SIDE.HOST ? space.hostDxOrg : space.guestDxOrg,
      data: {
        invitee: `user-${user.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
  }

  private async inviteAsContributor(user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE): Promise<void> {
    await this.adminClient.inviteUserToOrganization({
      orgDxId: side === SPACE_MEMBERSHIP_SIDE.HOST ? space.hostDxOrg : space.guestDxOrg,
      data: {
        invitee: `user-${user.dxuser}`,
        level: 'MEMBER',
        projectAccess: 'CONTRIBUTE',
        allowBillableActivities: false,
        appAccess: true,
        suppressEmailNotification: true,
      },
    })
  }

  private async inviteAsViewer(user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE): Promise<void> {
    await this.adminClient.inviteUserToOrganization({
      orgDxId: side === SPACE_MEMBERSHIP_SIDE.HOST ? space.hostDxOrg : space.guestDxOrg,
      data: {
        invitee: `user-${user.dxuser}`,
        level: 'MEMBER',
        projectAccess: 'VIEW',
        allowBillableActivities: false,
        appAccess: false,
        suppressEmailNotification: true,
      },
    })
  }
}
