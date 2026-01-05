import { Inject, Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP } from '@shared/domain/space-membership/providers/platform-access/space-membership-to-platform-access-provider.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { OrgMemberAccess } from '@shared/platform-client/platform-client.params'

@Injectable()
export class SpaceMembershipUpdatePermissionHelper {
  constructor(
    @Inject(SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP)
    private readonly spaceMembershipToPlatformAccessProviderMap: {
      [T in SpaceMembershipPermission]: SpaceMembershipPlatformAccessProvider
    },
  ) {}

  buildMembershipAccessPayload(
    memberships: SpaceMembership[],
  ): Record<DxId<'user'>, OrgMemberAccess> {
    return memberships.reduce(
      (acc, membership) => {
        acc[membership.user.getEntity().dxid] = !membership.active
          ? this.spaceMembershipToPlatformAccessProviderMap['disable'].memberAccess
          : this.spaceMembershipToPlatformAccessProviderMap[membership.role].memberAccess
        return acc
      },
      {} as Record<DxId<'user'>, OrgMemberAccess>,
    )
  }
}
