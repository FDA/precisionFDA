import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { BaseError, InvalidStateError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'

export abstract class SpaceMembershipUpdatePermissionProvider {
  @ServiceLogger()
  logger: Logger

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
      throw new PermissionError('Current user does not have permission to update memberships to target role')
    }
  }

  /**
   * Updates memberships and their organization access.
   * @returns Object containing:
   *   - memberships: The updated membership entities
   *   - pendingOrgAccessUpdates: Organization IDs where access updates failed and need retry
   */
  async update(
    space: Space,
    currentMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<{ memberships: SpaceMembership[]; pendingOrgAccessUpdates: DxId<'org'>[] }> {
    await this.updateMemberships(changeableMemberships)
    const pendingOrgAccessUpdates = await this.updateOrgsAccess(space, currentMembership, changeableMemberships)
    return { memberships: changeableMemberships, pendingOrgAccessUpdates }
  }

  /**
   * Updates organization access for memberships across all relevant orgs.
   * @returns Array of organization IDs where access updates failed and need to be retried later
   */
  protected async updateOrgsAccess(
    space: Space,
    membership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<DxId<'org'>[]> {
    const orgs = space.getMembershipOrg(membership)
    const promises = orgs.map(org => {
      return this.updateOrgAccess(org, changeableMemberships).catch(async (err: BaseError) => {
        this.logger.error(`Failed to update platform access for org ${org} and space ${space.id}: ${err.message}`)
        if (
          err.message.startsWith('InvalidState (422): Unable to modify membership settings for the following users') ||
          err.message === `PermissionDenied (401): Administrator access to ${org} required to perform this operation`
        ) {
          return org
        }
        throw err
      })
    })
    const pendingOrgAccessUpdates = (await Promise.all(promises)).filter(org => org !== undefined) as DxId<'org'>[]
    return pendingOrgAccessUpdates
  }

  protected async updateOrgAccess(org: DxId<'org'>, memberships: SpaceMembership[]): Promise<void> {
    return this.spaceMembershipPlatformAccessProvider.bulkUpdate(org, memberships)
  }

  protected async updateMemberships(memberships: SpaceMembership[]): Promise<void> {
    await this.em.transactional(async () => {
      for (const membership of memberships) {
        this.updateMembership(membership)
      }
      await this.em.persist(memberships).flush()
    })
  }
}
