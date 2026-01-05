import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { SpaceMembershipPlatformAccessToViewerProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-viewer.provider'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { PlatformClient } from '@shared/platform-client'

@Injectable()
export class SpaceMembershipUpdatePermissionToViewerProvider extends SpaceMembershipUpdatePermissionProvider {
  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    protected readonly spaceMembershipPlatformAccessToViewerProvider: SpaceMembershipPlatformAccessToViewerProvider,
  ) {
    super(
      em,
      platformClient,
      spaceMembershipRepository,
      spaceMembershipPlatformAccessToViewerProvider,
    )
  }

  protected permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[] = [
    SPACE_MEMBERSHIP_ROLE.LEAD,
    SPACE_MEMBERSHIP_ROLE.ADMIN,
  ]

  protected updateMembership(membership: SpaceMembership): void {
    membership.role = SPACE_MEMBERSHIP_ROLE.VIEWER
  }
}
