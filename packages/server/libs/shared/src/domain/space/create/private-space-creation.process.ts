import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

/**
 * Concrete subclass of {@link SpaceCreationProcess} for creating a Private space.
 */
@Injectable()
export class PrivateSpaceCreationProcess extends SpaceCreationProcess {
  constructor(
    user: UserContext,
    em: SqlEntityManager,
    notificationService: SpaceNotificationService,
    taggingService: TaggingService,
    private readonly userClient: PlatformClient,

    @Inject(ADMIN_PLATFORM_CLIENT) adminClient: PlatformClient,
  ) {
    super(user, em, notificationService, taggingService, adminClient)
  }

  protected async checkPermissions(user: User, input: CreateSpaceDTO): Promise<void> {
    if (!user) {
      throw new NotFoundError(`User with ID: ${this.user.id} was not found!`)
    }
    if (input.hostLeadDxuser !== user.dxuser) {
      throw new PermissionError(`You are not allowed to create new Private Space for another user!`)
    }
  }

  protected async buildOrgs(space: Space): Promise<void> {
    await super.createOrgForSpace(space.id, space.hostDxOrg)
  }

  protected async inviteMembers(
    space: Space,
    leads: {
      host: User
      guest: undefined
    },
  ): Promise<SpaceMembership[]> {
    const hostLead = leads.host

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

    const hostLeadMembership = new SpaceMembership(
      hostLead,
      space,
      SPACE_MEMBERSHIP_SIDE.HOST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )
    this.em.persist(hostLeadMembership)

    return [hostLeadMembership]
  }

  protected async buildProjects(space: Space, leads: SpaceMembership[]): Promise<void> {
    const hostLead = leads[0]

    await this.em.populate(hostLead, ['user.organization'])

    // create project as user creating the space
    const hostProject = await this.userClient.projectCreate(
      `precisionfda-${space.scope}-HOST`,
      hostLead.user.getEntity().billTo(),
    )
    this.logger.log(`created host project: ${hostProject.id} with lead: ${hostLead.user.getProperty('dxuser')}`)

    await this.userClient.projectInvite(hostProject.id, space.hostDxOrg, 'CONTRIBUTE')
    this.logger.log(`invited host org: ${space.hostDxOrg} to host project: ${hostProject.id}`)

    space.hostProject = hostProject.id as DxId<'project'>
    this.em.persist(space)
  }

  protected validateInput(): void {}

  protected async sendEmails(): Promise<void> {
    // no emails for private space - user is creating it for themselves and is redirected into it immediately
  }
}
