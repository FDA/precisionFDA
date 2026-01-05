import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { PlatformClient } from '@shared/platform-client'

@Injectable()
export class SpaceMembershipUpdatePermissionToActiveProvider extends SpaceMembershipUpdatePermissionProvider {
  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly spaceMembershipUpdatePermissionHelper: SpaceMembershipUpdatePermissionHelper,
  ) {
    super(em, platformClient, spaceMembershipRepository, null)
  }

  protected permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[] = [
    SPACE_MEMBERSHIP_ROLE.LEAD,
    SPACE_MEMBERSHIP_ROLE.ADMIN,
  ]

  protected updateMembership(membership: SpaceMembership): void {
    membership.active = true
  }

  protected async updateOrgAccess(org: DxId<'org'>, memberships: SpaceMembership[]): Promise<void> {
    await this.em.populate(memberships, ['user'])
    const payload =
      this.spaceMembershipUpdatePermissionHelper.buildMembershipAccessPayload(memberships)
    await this.platformClient.orgSetMemberAccess({
      orgDxId: org,
      data: payload,
    })
  }
}
