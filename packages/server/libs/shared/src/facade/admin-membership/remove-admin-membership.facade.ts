import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembershipService } from '@shared/domain/admin-membership/service/admin-membership.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class RemoveAdminMembershipFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly adminMembershipService: AdminMembershipService,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {}

  async removeMembership(id: number): Promise<void> {
    this.logger.log(`Removing admin membership id=${id}`)

    const membership = await this.adminMembershipService.findMembership(id)
    if (!membership) {
      this.logger.warn(`Admin membership id=${id} not found`)
      throw new InvalidStateError('Admin membership was not found - cannot be removed')
    }
    const user = await membership.user.load()
    const group = await membership.adminGroup.load()

    if (group.role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN && user.dxuser === config.platform.adminUser) {
      this.logger.warn(`Attempted to remove site admin role from root admin user=${user.dxuser}`)
      throw new PermissionError('Cannot remove site admin role from the root admin user')
    }

    if (group.role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN) {
      const leadMemberships = await this.spaceMembershipService.findActiveLeadMembershipsInAdminSpaces(user.id)
      if (leadMemberships.length > 0) {
        const spaceNames = leadMemberships.flatMap(m => m.spaces.getItems().map(s => s.name)).join(', ')
        this.logger.warn(`Cannot remove site admin role: user is lead in admin space(s): ${spaceNames}`)
        throw new InvalidStateError(
          `Cannot remove site admin role: user is still a lead in admin space(s): ${spaceNames}. Reassign the lead role first.`,
        )
      }
    }

    await this.em.transactional(async () => {
      this.adminMembershipService.removeRecord(membership)

      if (group.role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN) {
        await this.removeUserFromAdminSpaces(user)
      }
    })
  }

  private async removeUserFromAdminSpaces(user: User): Promise<void> {
    this.logger.log(`Removing user=${user.dxuser} from admin org=${config.platform.pfdaAdminOrg}`)
    await this.adminClient.removeUserFromOrganization({
      orgDxId: config.platform.pfdaAdminOrg,
      data: {
        user: `user-${user.dxuser}`,
        revokeProjectPermissions: true,
      },
    })

    const adminSpaces = await this.spaceService.findAdminSpaces()
    this.logger.log(`Deactivating user=${user.dxuser} in ${adminSpaces.length} admin space(s)`)
    for (const space of adminSpaces) {
      const found = await this.spaceMembershipService.deactivateAdminSpaceMembership(space, user)
      if (found && space.hostDxOrg) {
        this.logger.log(`Removing user=${user.dxuser} from admin space org=${space.hostDxOrg}`)
        await this.adminClient.removeUserFromOrganization({
          orgDxId: space.hostDxOrg,
          data: {
            user: `user-${user.dxuser}`,
            revokeProjectPermissions: true,
          },
        })
      }
    }
  }
}
