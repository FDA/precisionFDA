import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { config } from '@shared/config'
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
 * Concrete subclass of {@link SpaceCreationProcess} for creating a Groups space.
 */
@Injectable()
export class GroupsSpaceCreationProcess extends SpaceCreationProcess {

  constructor(
    userContext: UserContext,
    em: SqlEntityManager,
    notificationService: SpaceNotificationService,
    @Inject(ADMIN_PLATFORM_CLIENT) adminClient: PlatformClient,
  ) {
    super(userContext, em, notificationService, adminClient)
  }

  protected async checkPermissions(user: User, input: CreateSpaceDto): Promise<void> {
    if (!user) {
      throw new NotFoundError(`User with ID: ${this.userContext.id} was not found!`)
    }
    // space admin is called reviewSpaceAdmin but it's wrong - PFDA-5437 will resolve it in the future
    if (!await user.isSiteAdmin() && !await user.isReviewSpaceAdmin()) {
      throw new PermissionError('Only admins can create Groups spaces')
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

    try {
      const handle = getHandle(space.guestDxOrg)
      const org = await this.adminClient.createOrg(handle, handle)
      this.logger.log(`created guest org on platform: ${org.id} for space: ${space.id}`)

      //TODO: add auditing like rails have in packages/rails/app/services/org_service/create.rb#L12
    } catch (e) {
      // an error might be thrown when the org name already exist, but it is very unlikely so we do not handle any recovery
      this.logger.error(`error creating guest org on platform: ${space.guestDxOrg}`)
      throw e
    }
  }

  protected async inviteMembers(space: Space, leads: {
    host: User,
    guest: User
  }): Promise<SpaceMembership[]> {
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

    const hostLeadMembership = new SpaceMembership(hostLead, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.LEAD)
    const guestLeadMembership = new SpaceMembership(guestLead, space, SPACE_MEMBERSHIP_SIDE.GUEST, SPACE_MEMBERSHIP_ROLE.LEAD)
    this.em.persist([hostLeadMembership, guestLeadMembership])

    return [hostLeadMembership, guestLeadMembership]
  }

  protected async buildProjects(space: Space, leads: SpaceMembership[]): Promise<void> {
    const hostLead = leads[0]
    const guestLead = leads[1]

    await this.em.populate([hostLead, guestLead], ['user.organization'])

    const hostProject = await this.adminClient.projectCreate({
      name: `precisionfda-${space.uid}-HOST`,
      billTo: hostLead.user.getEntity().billTo(),
    })
    this.logger.log(`created host project: ${hostProject.id} with lead: ${hostLead.user.getProperty('dxuser')}`)

    const guestProject = await this.adminClient.projectCreate({
      name: `precisionfda-${space.uid}-GUEST`,
      billTo: guestLead.user.getEntity().billTo(),
    })
    this.logger.log(`created guest project: ${guestProject.id} with lead: ${guestLead.user.getProperty('dxuser')}`)

    // we could do two parallel calls to each project,
    // but not to the same one - you will get cannot acquire lock error from platform
    await this.adminClient.projectInvite({
      projectDxid: hostProject.id,
      invitee: space.hostDxOrg,
      level: 'CONTRIBUTE',
    })
    this.logger.log(`invited host org: ${space.hostDxOrg} to host project: ${hostProject.id}`)

    await this.adminClient.projectInvite({
      projectDxid: hostProject.id,
      invitee: space.guestDxOrg,
      level: 'CONTRIBUTE',
    })
    this.logger.log(`invited guest org: ${space.guestDxOrg} to host project: ${hostProject.id}`)

    await this.adminClient.projectInvite({
      projectDxid: guestProject.id,
      invitee: space.hostDxOrg,
      level: 'CONTRIBUTE',
    })
    this.logger.log(`invited host org: ${space.hostDxOrg} to guest project: ${guestProject.id}`)

    await this.adminClient.projectInvite({
      projectDxid: guestProject.id,
      invitee: space.guestDxOrg,
      level: 'CONTRIBUTE',
    })
    this.logger.log(`invited guest org: ${space.guestDxOrg} to guest project: ${guestProject.id}`)

    //INVESTIGATION NEEDED - PFDA-5212
    // https://jira.internal.dnanexus.com/browse/PFDA-5212?focusedId=297720&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-297720
    // SpaceService::Create#remove_pfda_admin_user in ruby
    await this.adminClient.removeUserFromOrganization({
      orgDxId: space.hostDxOrg,
      data: { user: `user-${config.platform.adminUser}` },
    })
    await this.adminClient.removeUserFromOrganization({
      orgDxId: space.guestDxOrg,
      data: { user: `user-${config.platform.adminUser}` },
    })

    space.hostProject = hostProject.id
    space.guestProject = guestProject.id
    this.em.persist(space)
  }
}
