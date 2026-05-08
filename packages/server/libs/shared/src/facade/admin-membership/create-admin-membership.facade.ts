import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { CreateAdminMembershipDTO } from '@shared/domain/admin-membership/dto/create-admin-membership.dto'
import { AdminMembershipService } from '@shared/domain/admin-membership/service/admin-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class CreateAdminMembershipFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly adminMembershipService: AdminMembershipService,
    private readonly userService: UserService,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {}

  async createMembership(dto: CreateAdminMembershipDTO): Promise<{ id: number }> {
    this.logger.log(`Creating admin membership for userId=${dto.userId} with role=${dto.group}`)

    const user = await this.userService.getUserById(dto.userId)
    if (!user) {
      this.logger.warn(`User with id ${dto.userId} not found, cannot create admin membership`)
      throw new InvalidStateError(`User with id ${dto.userId} not found`)
    }
    const adminGroup = await this.adminMembershipService.findAdminGroupOrFail(dto.group)

    const membershipId = await this.em.transactional(async () => {
      const membership = await this.adminMembershipService.createRecord(user, adminGroup)

      if (dto.group === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN) {
        await this.addUserToAdminSpaces(user)
      }

      return membership.id
    })

    return { id: membershipId }
  }

  private async addUserToAdminSpaces(user: User): Promise<void> {
    this.logger.log(`Inviting user=${user.dxuser} to admin org=${config.platform.pfdaAdminOrg}`)
    await this.adminClient.inviteUserToOrganization({
      orgDxId: config.platform.pfdaAdminOrg,
      data: {
        invitee: `user-${user.dxuser}`,
        level: 'MEMBER',
        projectAccess: 'CONTRIBUTE',
        allowBillableActivities: true,
        suppressEmailNotification: true,
      },
    })

    const adminSpaces = await this.spaceService.findAdminSpaces()
    this.logger.log(`Adding user=${user.dxuser} to ${adminSpaces.length} admin space(s)`)
    for (const space of adminSpaces) {
      await this.spaceMembershipService.activateOrCreateAdminSpaceMembership(user, space)
      if (space.hostProject) {
        this.logger.log(`Inviting user=${user.dxuser} to admin space project=${space.hostProject}`)
        await this.adminClient.projectInvite(space.hostProject, `user-${user.dxuser}`, 'ADMINISTER')
      }
    }
  }
}
