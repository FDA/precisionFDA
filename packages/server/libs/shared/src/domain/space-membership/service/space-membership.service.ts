import { Inject, Injectable, Logger } from '@nestjs/common'
import { SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP } from '@shared/domain/space-membership/service/update-permission/space-membership-to-update-permission-provider.provider'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { SpaceMembership } from '../space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership.enum'
import { SpaceMembershipRepository } from '../space-membership.repository'

@Injectable()
export class SpaceMembershipService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly userContext: UserContext,
    private readonly platformClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    @Inject(SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP)
    private readonly spaceMembershipUpdatePermissionProviderMap: {
      [T in SpaceMembershipPermission]: SpaceMembershipUpdatePermissionProvider
    },
    private readonly spaceMembershipUpdatePermissionHelper: SpaceMembershipUpdatePermissionHelper,
  ) {}

  getCurrentMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    return this.spaceMembershipRepository.getMembership(spaceId, userId)
  }

  async getCurrentUserMembershipInSharedSpace(spaceId: number): Promise<SpaceMembership | null> {
    return this.spaceMembershipRepository.findOne({
      user: this.userContext.id,
      active: true,
      spaces: {
        state: SPACE_STATE.ACTIVE,
        id: spaceId,
        space: null,
      },
    })
  }

  async updatePermission(
    space: Space,
    currentMembership: SpaceMembership,
    membershipIds: number[],
    targetPermission: SpaceMembershipPermission,
  ): Promise<SpaceMembership[]> {
    const provider = this.spaceMembershipUpdatePermissionProviderMap[targetPermission]
    await provider.validateUpdaterRole(currentMembership)

    const changeableMemberships = await this.spaceMembershipRepository.findChangeableMemberships(
      space,
      membershipIds,
      targetPermission !== 'enable',
      currentMembership,
    )
    if (changeableMemberships.length === 0) {
      throw new InvalidStateError('No memberships can be changed')
    }

    await provider.update(space, currentMembership, changeableMemberships)
    return changeableMemberships
  }

  async syncPlatformAccess(spaceId: number, memberIds: number[]): Promise<void> {
    this.logger.log(`Syncing platform access for space ${spaceId} and members ${memberIds}`)
    if (memberIds.length === 0) {
      return
    }

    const memberships = await this.spaceMembershipRepository.find(
      {
        id: { $in: memberIds },
        spaces: {
          state: SPACE_STATE.ACTIVE,
          id: spaceId,
        },
      },
      {
        populate: ['user', 'spaces'],
      },
    )

    if (memberships.length === 0) {
      this.logger.warn(`No memberships found for space ${spaceId} and members ${memberIds}`)
      return
    }

    const space = memberships[0].spaces.getItems().find((s) => s.id === spaceId)
    const membershipAccessPayload =
      this.spaceMembershipUpdatePermissionHelper.buildMembershipAccessPayload(memberships)
    const orgs = space.getMembershipOrg(memberships[0])
    const promises = orgs.map((org) => {
      return this.platformClient.orgSetMemberAccess({
        orgDxId: org,
        data: membershipAccessPayload,
      })
    })
    await Promise.all(promises)
  }

  async syncSpaceLeadBillTo(leadMembershipId: number): Promise<void> {
    this.logger.log(`Syncing space lead billTo for membership ${leadMembershipId}`)
    const leadMembership = await this.spaceMembershipRepository.findOne(
      { id: leadMembershipId, role: SPACE_MEMBERSHIP_ROLE.LEAD, active: true },
      { populate: ['spaces', 'spaces.confidentialSpaces', 'user', 'user.organization'] },
    )
    if (!leadMembership) {
      throw new InvalidStateError('Lead membership not found')
    }
    const spaces = leadMembership.spaces.getItems()
    if (spaces[0].type === SPACE_TYPE.REVIEW && spaces.length === 1) {
      // in case there are 2 memberships created for lead in a review space
      // populate confidential spaces based on the shared space
      const cfSpaces = spaces[0].confidentialSpaces.getItems()
      if (cfSpaces.length > 0) {
        spaces.push(...cfSpaces)
      }
    }

    for (const space of spaces) {
      const project = leadMembership.isHost() ? space.hostProject : space.guestProject
      if (project) {
        // project is null if confidential space is different from the lead side
        const projectDescribe = await this.adminClient.projectDescribe(project)
        const leadBillTo = leadMembership.user.getEntity().billTo()
        if (projectDescribe.billTo !== leadBillTo) {
          await this.adminClient.projectUpdate(project, { billTo: leadBillTo })
        }
      }
    }
  }
}
