import { SqlEntityManager, TransactionPropagation } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { getProjectDxid } from '@shared/domain/space/space.helper'
import { SpaceMembershipPlatformAccessToAdminProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access-to-admin.provider'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
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
    super(em, platformClient, spaceMembershipRepository, spaceMembershipPlatformAccessToAdminProvider)
  }

  protected permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[] = [SPACE_MEMBERSHIP_ROLE.LEAD]

  protected updateMembership(membership: SpaceMembership): void {
    membership.role = SPACE_MEMBERSHIP_ROLE.LEAD
  }

  override async update(
    space: Space,
    currentLeadMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<SpaceMembership[]> {
    if (changeableMemberships.length !== 1 && new Set(changeableMemberships.map(m => m.user.id)).size !== 1) {
      throw new Error('Cannot update multiple memberships to lead role at once')
    }

    const newLead = changeableMemberships[0]
    await this.em.populate(newLead, ['user', 'user.organization'])
    const billTo = newLead.user.getEntity().billTo()

    await this.updateOrgsAccess(space, currentLeadMembership, changeableMemberships)

    // Update the project's billTo to the new lead's organization
    const project = getProjectDxid(space, currentLeadMembership)
    // project should not be null here
    await this.updateSpaceBillTo(project as DxId<'project'>, billTo as DxId<'org'>)
    if (space.type === SPACE_TYPE.REVIEW) {
      await this.em.populate(space, ['confidentialSpaces'])
      const confidentialSpace = currentLeadMembership.isHost()
        ? space.confidentialReviewerSpace
        : space.confidentialSponsorSpace
      const cfProject = getProjectDxid(confidentialSpace, currentLeadMembership)
      await this.updateSpaceBillTo(cfProject as DxId<'project'>, billTo as DxId<'org'>)
    }

    return await this.em.transactional(
      async () => {
        currentLeadMembership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
        changeableMemberships.forEach(m => {
          m.role = SPACE_MEMBERSHIP_ROLE.LEAD
          if (m.side !== currentLeadMembership.side) {
            m.side = currentLeadMembership.side
          }
        })
        if (space.type === SPACE_TYPE.REVIEW) {
          const cfDemotedLead = await this.spaceMembershipRepository.findConfidentialMembershipByUser(
            space.id,
            currentLeadMembership.user.id,
            currentLeadMembership.side,
          )
          if (cfDemotedLead && cfDemotedLead.id !== currentLeadMembership.id) {
            cfDemotedLead.role = SPACE_MEMBERSHIP_ROLE.ADMIN
          }
        }
        await this.em.flush()
        return changeableMemberships
      },
      {
        propagation: TransactionPropagation.REQUIRED,
      },
    )
  }

  override async updateOrgsAccess(
    space: Space,
    membership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<void> {
    const orgs = space.getMembershipOrg(membership)
    const promises = orgs.map(org => {
      return this.adminClient.orgSetMemberAccess({
        orgDxId: org,
        data: {
          [changeableMemberships[0].user.getEntity().dxid]:
            this.spaceMembershipPlatformAccessToAdminProvider.memberAccess,
        },
      })
    })
    await Promise.all(promises)
  }

  private async updateSpaceBillTo(projectDxid: DxId<'project'>, billTo: DxId<'org'>): Promise<ClassIdResponse> {
    const projectDescribe = await this.adminClient.projectDescribe(projectDxid)
    if (projectDescribe.billTo === billTo) {
      return {
        id: projectDxid,
      }
    }
    return this.adminClient.projectUpdate(projectDxid, { billTo })
  }
}
