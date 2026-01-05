import { SqlEntityManager } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { PlatformClient } from '@shared/platform-client'
import { OrgMemberAccess } from '@shared/platform-client/platform-client.params'
import { SpaceMembership } from '../../space-membership.entity'

export abstract class SpaceMembershipPlatformAccessProvider {
  protected constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
  ) {}

  public abstract readonly memberAccess: OrgMemberAccess

  async bulkUpdate(orgDxId: DxId<'org'>, memberships: SpaceMembership[]): Promise<void> {
    await this.em.populate(memberships, ['user'])
    const memberAccessPayload = memberships.reduce(
      (acc, curr) => {
        acc[`${curr.user.getEntity().dxid}`] = this.memberAccess
        return acc
      },
      {} as Record<DxId<'user'>, OrgMemberAccess>,
    )

    await this.platformClient.orgSetMemberAccess({
      orgDxId,
      data: memberAccessPayload,
    })
  }
}
