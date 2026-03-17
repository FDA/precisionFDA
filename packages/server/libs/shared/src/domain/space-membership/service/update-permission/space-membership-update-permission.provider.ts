import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { BaseError, PermissionError } from '@shared/errors'
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

  async update(
    space: Space,
    currentMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<SpaceMembership[]> {
    await this.updateMemberships(changeableMemberships)
    await this.updateOrgsAccess(space, currentMembership, changeableMemberships)
    return changeableMemberships
  }

  protected async updateOrgsAccess(
    space: Space,
    membership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<void> {
    const orgs = space.getMembershipOrg(membership)
    const promises = orgs.map(org => {
      return this.updateOrgAccess(org, changeableMemberships).catch((err: BaseError) => {
        if (
          space.type === SPACE_TYPE.GROUPS &&
          err.message === `PermissionDenied (401): Administrator access to ${org} required to perform this operation`
        ) {
          // Log the error and continue with other orgs
          this.logger.error(`Failed to update platform access for org ${org} and space ${space.id}: ${err.message}`)
          this.logger.error(
            'This happens for legacy orgs where the leads were not invited to the reverse org when the org was created',
          )
          // TODO(PFDA-6821): create task to sync access for failure org by utilizing admin token

          return
        }
        throw err
      })
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
      await this.em.persist(memberships).flush()
    })
  }
}
