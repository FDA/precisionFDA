import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { getHandle } from '@shared/domain/org/org.utils'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError, PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

/**
 * Concrete subclass of {@link SpaceCreationProcess} for creating an Administrator space.
 */
@Injectable()
export class AdministratorSpaceCreationProcess extends SpaceCreationProcess {

  constructor(
    userContext: UserContext,
    em: SqlEntityManager,
    notificationService: SpaceNotificationService,
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT) adminClient: PlatformClient,
  ) {
    super(userContext, em, notificationService, adminClient)
  }

  protected async checkPermissions(user: User, input: CreateSpaceDto): Promise<void> {
    if (!user) {
      throw new NotFoundError(`User with ID: ${this.userContext.id} was not found!`)
    }
    // space admin is called reviewSpaceAdmin but it's wrong - PFDA-5437 will resolve it in the future
    if (!await user.isSiteAdmin()) {
      throw new PermissionError('Only admins can create Administrator space')
    }
    if (input.hostLeadDxuser !== user.dxuser) {
      throw new PermissionError(`You are not allowed to create new Administrator Space for another user!`)
    }
  }

  protected async buildOrgs(space: Space): Promise<void> {
    try {
      const handle = getHandle(space.hostDxOrg)
      const org = await this.adminClient.createOrg(handle, handle)
      this.logger.log(`created host org on platform: ${org.id} for space: ${space.id}`)
      //TODO: add auditing like rails have in packages/rails/app/services/org_service/create.rb#L12
    } catch (e) {
      // an error might be thrown when the org name already exist, but it is very unlikely so we do not handle any recovery
      this.logger.error(`error creating host org on platform: ${space.hostDxOrg}`)
      throw e
    }
  }

  protected async inviteMembers(space: Space, leads: {
    host: User,
    guest: never
  }): Promise<SpaceMembership[]> {
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
    const spaceMemberships = admins.map((admin) => new SpaceMembership(admin, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.ADMIN))

    const hostLeadMembership = new SpaceMembership(hostLead, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.LEAD)

    this.em.persist([hostLeadMembership, ...spaceMemberships])

    return [hostLeadMembership, ...spaceMemberships]
  }

  protected async buildProjects(space: Space, leads: SpaceMembership[]): Promise<void> {
    const hostLead = leads[0]

    await this.em.populate(hostLead, ['user.organization'])

    // create project as user creating the space
    const hostProject = await this.userClient.projectCreate({
      name: `precisionfda-${space.uid}-HOST`,
      billTo: hostLead.user.getEntity().billTo(),
    })
    this.logger.log(`created host project: ${hostProject.id} with lead: ${hostLead.user.getProperty('dxuser')}`)

    await this.userClient.projectInvite({
      projectDxid: hostProject.id,
      invitee: space.hostDxOrg,
      level: 'CONTRIBUTE',
    })
    this.logger.log(`invited host org: ${space.hostDxOrg} to host project: ${hostProject.id}`)


    await this.adminClient.removeUserFromOrganization({
      orgDxId: space.hostDxOrg,
      data: { user: `user-${config.platform.adminUser}` },
    })

    space.hostProject = hostProject.id
    this.em.persist(space)
  }
}
