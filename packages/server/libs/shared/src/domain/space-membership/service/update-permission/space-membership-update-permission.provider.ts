import { SqlEntityManager } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { Space } from '@shared/domain/space/space.entity'
import { PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'

export abstract class SpaceMembershipUpdatePermissionProvider {
  protected constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    protected readonly spaceMembershipPlatformAccessProvider: SpaceMembershipPlatformAccessProvider,
  ) {}

  protected abstract permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[]
  protected abstract updateMembership(membership: SpaceMembership): void

  async validateUpdaterRole(currentMembership: SpaceMembership): Promise<void> {
    if (!this.permittedUpdaterRoles.includes(currentMembership.role)) {
      throw new PermissionError(
        'Current user does not have permission to update memberships to target role',
      )
    }
  }

  async update(
    space: Space,
    currentMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<number[]> {
    await this.updateMemberships(changeableMemberships)
    await this.updateOrgsAccess(space, currentMembership, changeableMemberships)
    return changeableMemberships.map((m) => m.id)
  }

  protected async updateOrgsAccess(
    space: Space,
    membership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<void> {
    const orgs = space.getMembershipOrg(membership)
    const promises = orgs.map((org) => {
      return this.updateOrgAccess(org, changeableMemberships)
    })
    await Promise.all(promises)
  }

  protected async updateOrgAccess(org: DxId<'org'>, memberships: SpaceMembership[]): Promise<void> {
    return this.spaceMembershipPlatformAccessProvider.bulkUpdate(org, memberships)
  }

  protected async updateMemberships(memberships: SpaceMembership[]): Promise<void> {
    await this.em.transactional(async () => {
      for (const membership of memberships) {
        this.updateMembership(membership)
      }
      this.em.persist(memberships)
    })
  }
}
