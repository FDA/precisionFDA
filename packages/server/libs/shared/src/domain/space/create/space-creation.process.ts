import { SqlEntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { Logger } from 'nestjs-pino'

/**
 * Abstract class representing the process of creating a space.
 *
 * This class follows the "Template Method" design pattern, providing a blueprint
 * for the sequence of steps required to create and set up a space. It contains
 * both concrete methods and abstract methods that must be implemented by subclasses.
 *
 * @abstract
 */
export abstract class SpaceCreationProcess {

  @ServiceLogger()
  protected readonly logger: Logger

  protected constructor(
    protected readonly userContext: UserContext,
    protected readonly em: SqlEntityManager,
    protected readonly notificationService: SpaceNotificationService,
    protected readonly adminClient: PlatformClient,
  ) {
  }

  /**
   * Main method to build the space.
   *
   * This method implements the "Template Method" design pattern. It defines the
   * sequence of steps required to create and set up a space, some of which are
   * provided by this base class, while others must be implemented by subclasses.
   *
   * The steps involved are:
   *
   * 0. {@link checkPermissions} - Checks if the user has the necessary permissions to create the space type.
   * 1. {@link findLeads} - Checks if the host and guest leads exist and are active.
   * 2. {@link createDbRecord} - Creates a database record for the space.
   * 3. {@link buildOrgs} - Abstract method; handles the creation of required organizations on the platform.
   * 4. {@link inviteMembers} - Abstract method; invite members to the space.
   * 5. {@link buildProjects} - Abstract method; create projects and invite organizations to it.
   * 6. {@link sendEmails} - Notify provided users about new space with link to it.
   *
   * **Note**: Some of these steps are intentionally left empty or abstract because
   * the exact implementation will depend on the specific type of space being created.
   * Subclasses are expected to provide the necessary logic where applicable.
   *
   * @returns {Promise<number>} The ID of the created space.
   *
   * @throws {NotFoundError} If the host or guest lead user is not found or deactivated.
   * @throws {Error} For any other errors that occur during the execution of the steps.
   */
  public async build(input: CreateSpaceDto): Promise<number> {

    const user = await this.em.findOne(User, {
      id: this.userContext.id,
      userState: USER_STATE.ENABLED,
    })
    await this.checkPermissions(user, input)
    const leads = await this.findLeads(input)

    return await this.em.transactional(async () => {

      const space = await this.createDbRecord(input)
      await this.buildOrgs(space)
      const memberships = await this.inviteMembers(space, leads)
      if (input.forChallenge) {
        await this.inviteChallengeBot(space)
      }
      await this.buildProjects(space, memberships)
      const users = memberships.map(m => m.user.getEntity())
      await this.sendEmails(space, users)
      return space.id
    })
  }

  private async findLeads(input: CreateSpaceDto) {
    let hostLead: User, guestLead: User

    hostLead = await this.em.findOne(User, {
      dxuser: input.hostLeadDxuser, userState: { $ne: USER_STATE.DEACTIVATED },
    })
    if (!hostLead) {
      throw new NotFoundError(`Host lead user: ${input.hostLeadDxuser} was not found or is not active !`)
    }

    if (input.guestLeadDxuser) {
      guestLead = await this.em.findOne(User, {
        dxuser: input.guestLeadDxuser,
        userState: { $ne: USER_STATE.DEACTIVATED },
      })
      if (!guestLead) {
        throw new NotFoundError(`Guest lead user: ${input.guestLeadDxuser} was not found or is not active !`)
      }
    }

    return { host: hostLead, guest: guestLead }
  }

  private async createDbRecord(input: CreateSpaceDto): Promise<Space> {
    const space = input.buildEntity()
    await this.em.persistAndFlush(space)
    if (input.spaceType === SPACE_TYPE.PRIVATE_TYPE) {
      space.spaceId = space.id
    }
    return space
  }

  protected abstract checkPermissions(user: User, input: CreateSpaceDto): Promise<void>

  protected abstract buildOrgs(space: Space): Promise<void>

  protected abstract inviteMembers(space: Space, leads: {
    host: User,
    guest: User
  }): Promise<SpaceMembership[]>

  protected abstract buildProjects(space: Space, leads: SpaceMembership[]): Promise<void>

  private async inviteChallengeBot(space: Space): Promise<void> {
    // invite challenge bot as admin by host lead - only applicable for challenge's group space.
    const challengeBot = await this.em.findOne(User, { dxuser: config.platform.challengeBotUser })
    if (!challengeBot) {
      throw new NotFoundError(`Challenge bot user: ${config.platform.challengeBotUser} was not found !`)
    }

    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.hostDxOrg,
      data: {
        invitee: `user-${challengeBot.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited challenge bot: ${challengeBot.dxuser} to host org: ${space.hostDxOrg}`)

    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.guestDxOrg,
      data: {
        invitee: `user-${challengeBot.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited challenge bot: ${challengeBot.dxuser} to guest org: ${space.guestDxOrg}`)

    const membership = new SpaceMembership(challengeBot, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.ADMIN)
    this.em.persist(membership)
  }

  protected async sendEmails(space: Space, users: User[]): Promise<void> {
    for (const user of users) {
      await this.notificationService.notifySpaceCreated(space, user)
    }
  }
}
