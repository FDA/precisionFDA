import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
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
 * Concrete subclass of {@link SpaceCreationProcess} for creating an Administrator space.
 */
@Injectable()
export class AdministratorSpaceCreationProcess extends SpaceCreationProcess {
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
    // space admin is called reviewSpaceAdmin, but it's wrong - PFDA-5437 will resolve it in the future
    if (!(await user.isSiteAdmin())) {
      throw new PermissionError('Only admins can create Administrator space')
    }
    if (input.hostLeadDxuser !== user.dxuser) {
      throw new PermissionError(`You are not allowed to create new Administrator Space for another user!`)
    }
  }

  protected async buildOrgs(space: Space): Promise<void> {
    await super.createOrgForSpace(space.id, space.hostDxOrg)
  }

  protected async inviteMembers(
    space: Space,
    leads: {
      host: User
      guest: never
    },
  ): Promise<SpaceMembership[]> {
    const hostLead = leads.host

    await this.adminClient.inviteUserToOrganization({
      orgDxId: space.hostDxOrg,
      data: {
        invitee: `user-${hostLead.dxuser}`,
        level: 'ADMIN',
        suppressEmailNotification: true,
      },
    })
    this.logger.log(`invited host lead: ${hostLead.dxuser} to host org: ${space.hostDxOrg}`)

    // find rest of site admins except the lead
    const admins = await this.em.find(User, {
      dxuser: { $ne: hostLead.dxuser },
      adminMemberships: {
        adminGroup: { role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN },
      },
    })
    for (const admin of admins) {
      //TODO: remove after PFDA-5400 is done
      if (admin.dxuser === config.platform.adminUser) {
        continue
      }
      await this.adminClient.inviteUserToOrganization({
        orgDxId: space.hostDxOrg,
        data: {
          invitee: `user-${admin.dxuser}`,
          level: 'ADMIN',
          suppressEmailNotification: true,
        },
      })
      this.logger.log(`invited host admin: ${admin.dxuser} to host org: ${space.hostDxOrg}`)
    }
    const spaceMemberships = admins.map(
      admin => new SpaceMembership(admin, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.ADMIN),
    )

    const hostLeadMembership = new SpaceMembership(
      hostLead,
      space,
      SPACE_MEMBERSHIP_SIDE.HOST,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )

    this.em.persist([hostLeadMembership, ...spaceMemberships])

    return [hostLeadMembership, ...spaceMemberships]
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
}
