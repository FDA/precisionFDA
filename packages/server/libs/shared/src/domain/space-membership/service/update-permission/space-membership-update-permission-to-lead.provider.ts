import { EntityData, SqlEntityManager, TransactionPropagation } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { SpaceMembershipPlatformAccessToAdminProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-admin.provider'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { InternalError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class SpaceMembershipUpdatePermissionToLeadProvider extends SpaceMembershipUpdatePermissionProvider {
  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    protected readonly spaceMembershipPlatformAccessToAdminProvider: SpaceMembershipPlatformAccessToAdminProvider,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {
    super(
      em,
      platformClient,
      spaceMembershipRepository,
      spaceMembershipPlatformAccessToAdminProvider,
    )
  }

  protected permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[] = [SPACE_MEMBERSHIP_ROLE.LEAD]

  protected updateMembership(membership: SpaceMembership): void {
    membership.role = SPACE_MEMBERSHIP_ROLE.LEAD
  }

  override async update(
    space: Space,
    currentMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<number[]> {
    if (
      changeableMemberships.length !== 1 &&
      new Set(changeableMemberships.map((m) => m.user.id)).size !== 1
    ) {
      throw new Error('Cannot update multiple memberships to lead role at once')
    }

    const newLead = changeableMemberships[0]
    await this.em.populate(newLead, ['user', 'user.organization'])
    const billTo = newLead.user.getEntity().billTo()

    await super.updateOrgsAccess(space, currentMembership, changeableMemberships)

    await this.em.populate(changeableMemberships, ['spaces'])
    // in review spaces, a membership is pointed to review space and confidential space,
    // but in some cases, different memberships are created for review space and confidential space
    for (const membership of changeableMemberships) {
      const spaces = membership.spaces.getItems()
      for (const space of spaces) {
        const project = currentMembership.isHost() ? space.hostProject : space.guestProject
        await this.updateSpaceBillTo(project as DxId<'project'>, billTo as DxId<'org'>)
      }
    }

    await this.em.transactional(
      async () => {
        currentMembership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
        const membershipIds = changeableMemberships.map((m) => m.id)
        const updateData: EntityData<SpaceMembership> = {
          role: SPACE_MEMBERSHIP_ROLE.LEAD,
          updatedAt: new Date(),
        }
        if (space.type === SPACE_TYPE.GROUPS && currentMembership.side !== newLead.side) {
          updateData.side = currentMembership.side
        }
        const updatedCount = await this.spaceMembershipRepository.nativeUpdate(
          { id: { $in: membershipIds } },
          updateData,
        )
        if (updatedCount !== membershipIds.length) {
          throw new InternalError('Not all records were updated')
        }

        if (space.type === SPACE_TYPE.REVIEW) {
          const cfDemotedLead =
            await this.spaceMembershipRepository.findConfidentialMembershipByUser(
              space.id,
              currentMembership.user.id,
              currentMembership.side,
            )
          if (cfDemotedLead) {
            cfDemotedLead.role = SPACE_MEMBERSHIP_ROLE.ADMIN
          }
        }
        await this.em.flush()
      },
      {
        propagation: TransactionPropagation.REQUIRED,
      },
    )

    return [newLead.id]
  }

  private async updateSpaceBillTo(
    projectDxid: DxId<'project'>,
    billTo: DxId<'org'>,
  ): Promise<ClassIdResponse> {
    return this.adminClient.projectUpdate(projectDxid, { billTo })
  }
}
