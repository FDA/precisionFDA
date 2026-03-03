import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { SpaceMembershipPlatformAccessProvider } from '@shared/domain/space-membership/providers/platform-access/space-membership-platform-access.provider'
import { SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP } from '@shared/domain/space-membership/providers/platform-access/space-membership-to-platform-access-provider.provider'
import { SpaceMembershipCountService } from '@shared/domain/space-membership/service/space-membership-count.service'
import { SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP } from '@shared/domain/space-membership/service/update-permission/space-membership-to-update-permission-provider.provider'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { getOppositeOrgDxid } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { UserInviteToOrgResponse } from '@shared/platform-client/platform-client.responses'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { SpaceMembership } from '../space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership.enum'
import { SpaceMembershipRepository } from '../space-membership.repository'

@Injectable()
export class SpaceMembershipService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
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
    @Inject(SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP)
    private readonly spaceMembershipToPlatformAccessProviderMap: {
      [T in SpaceMembershipPermission]: SpaceMembershipPlatformAccessProvider
    },
    private readonly spaceMembershipCountService: SpaceMembershipCountService,
  ) {}

  async countBySpace(spaceId: number): Promise<number> {
    return this.spaceMembershipCountService.countBySpace(spaceId)
  }

  async getCurrentMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    const membership = await this.spaceMembershipRepository.getMembership(spaceId, userId)
    if (!membership) {
      throw new NotFoundError(`Couldn't find membership for user ${userId}`)
    }
    return membership
  }

  async getMembershipInSpace(spaceId: number, membershipId: number): Promise<SpaceMembership> {
    return this.spaceMembershipRepository.findOne({
      id: membershipId,
      spaces: spaceId,
    })
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

  async createMembership(
    currentMembership: SpaceMembership,
    space: Space,
    user: User,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<SpaceMembership> {
    const newMembership = new SpaceMembership(user, space, currentMembership.side, role)
    if (space.type === SPACE_TYPE.REVIEW) {
      await this.em.populate(space, ['confidentialSpaces'])
      newMembership.spaces.add(
        currentMembership.isHost() ? space.confidentialReviewerSpace : space.confidentialSponsorSpace,
      )
    }
    await this.em.persist(newMembership).flush()
    return newMembership
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

  async changeLeadRole(
    sharedSpace: Space,
    currentLeadMember: SpaceMembership,
    newLeadUser: User,
  ): Promise<SpaceMembership[]> {
    const newLeadMember = await this.spaceMembershipRepository.getMembership(sharedSpace.id, newLeadUser.id)

    if (newLeadMember) {
      if (newLeadMember.id === currentLeadMember.id) {
        throw new InvalidStateError('The new lead is already the current lead')
      }
      if (newLeadMember.role === SPACE_MEMBERSHIP_ROLE.LEAD) {
        throw new InvalidStateError('The new lead is already a lead in the space')
      }
    }

    const allLeadMemberships: SpaceMembership[] = []
    if (!newLeadMember) {
      this.logger.log(`Created new lead membership for user ${newLeadUser.dxuser} in space ${sharedSpace.id}`)
      const leadMembership = await this.createMembership(
        currentLeadMember,
        sharedSpace,
        newLeadUser,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      allLeadMemberships.push(leadMembership)
    } else {
      allLeadMemberships.push(newLeadMember)
      // TODO (PFDA-6418): handle multiple members linked to shared space and confidential space, remove this after fixing the database
      if (sharedSpace.type === SPACE_TYPE.REVIEW) {
        const cfNewLeadMembership = await this.spaceMembershipRepository.findConfidentialMembershipByUser(
          sharedSpace.id,
          newLeadMember.user.id,
          newLeadMember.side,
        )
        if (cfNewLeadMembership && cfNewLeadMembership.id !== newLeadMember.id) {
          allLeadMemberships.push(cfNewLeadMembership)
        }
      }
    }

    // Ensure the new lead has admin access in all orgs related to the space
    const spaceOrgs = sharedSpace.getMembershipOrg(currentLeadMember)
    const promises = spaceOrgs.map(org =>
      this.adminClient
        .orgFindMembers({
          orgDxid: org,
          id: [newLeadUser.dxid],
        })
        .then((findResult): Promise<UserInviteToOrgResponse | void> => {
          const results = findResult.results
          return results.length === 0
            ? this.adminClient.inviteUserToOrganization({
                orgDxId: org,
                data: {
                  invitee: newLeadUser.dxid,
                  suppressEmailNotification: true,
                  ...this.spaceMembershipToPlatformAccessProviderMap[SPACE_MEMBERSHIP_ROLE.ADMIN].memberAccess,
                },
              })
            : Promise.resolve()
        }),
    )
    await Promise.all(promises)
    if (sharedSpace.type !== SPACE_TYPE.GROUPS) {
      const oppositeOrgDxid = getOppositeOrgDxid(sharedSpace, currentLeadMember)
      if (oppositeOrgDxid) {
        await this.adminClient
          .orgFindMembers({
            orgDxid: oppositeOrgDxid,
            id: [newLeadUser.dxid],
          })
          .then(findResult => {
            const results = findResult.results
            if (results.length === 0) {
              return
            }
            return this.adminClient.removeUserFromOrganization({
              orgDxId: oppositeOrgDxid,
              data: {
                user: newLeadUser.dxid,
              },
            })
          })
      }
    }
    const leadProvider = this.spaceMembershipUpdatePermissionProviderMap[SPACE_MEMBERSHIP_ROLE.LEAD]
    const updatedMemberships = await leadProvider.update(sharedSpace, currentLeadMember, allLeadMemberships)
    return updatedMemberships
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

    const space = memberships[0].spaces.getItems().find(s => s.id === spaceId)
    const membershipAccessPayload = this.spaceMembershipUpdatePermissionHelper.buildMembershipAccessPayload(memberships)
    const orgs = space.getMembershipOrg(memberships[0])
    const promises = orgs.map(org => {
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
