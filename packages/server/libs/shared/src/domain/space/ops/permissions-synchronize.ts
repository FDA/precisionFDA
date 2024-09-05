import { partition } from 'ramda'
import { Space } from '../space.entity'
import { SpaceMembership } from '../../space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../../space-membership/space-membership.enum'
import { SPACE_TYPE } from '../space.enum'
import { UserOpsCtx } from '../../../types'
import { PlatformClient } from '../../../platform-client'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { OrgFindMembersReponse, PlatformMember } from '../../../platform-client/platform-client.responses'
import { UserInviteToOrgParams, UserRemoveFromOrgParams } from '../../../platform-client/platform-client.params'

type SyncSpacesPermissionsInput = {}


export class SyncSpacesPermissionsOperation extends WorkerBaseOperation<
  UserOpsCtx,
  SyncSpacesPermissionsInput,
  void
> {
  protected client: PlatformClient
  protected membership: SpaceMembership

  async run(input: SyncSpacesPermissionsInput): Promise<void> {
    this.client = new PlatformClient({ accessToken: this.ctx.user.accessToken }, this.ctx.log)
    const userId = this.ctx.user.id
    const em = this.ctx.em
    const spaceRepo = em.getRepository(Space)

    // only fetch spaces where user is member and has ADMIN / LEAD access
    const spaces = await spaceRepo.find({
      spaceMemberships: {
        user: {
          id: this.ctx.user.id,
        },
        role: {
          $in: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD],
        },
      },
    })

    for (const space of spaces) {
      const memberships = await space.spaceMemberships.loadItems()
      for (const member of memberships) {
        await member.user.load()
        if (!this.membership && member.user.id === userId) {
          this.membership = member
        }
      }
      if (this.membership) {
        this.ctx.log.warn(
          {},
          'SyncSpacesPermissionsOperation: CHECKING space_id: %d, type: %s, side: %s on behalf of %s',
          space.id, SPACE_TYPE[space.type], SPACE_MEMBERSHIP_SIDE[this.membership.side], this.ctx.user.dxuser,
        )
      } else {
        this.ctx.log.warn(
          {},
          'Triggering user membership was not found for space_id: %s, SKIPPING CHECK', space.id,
        )
        continue
      }


      const [host_members, guest_members] = partition(
        (sm: SpaceMembership) => sm.side === SPACE_MEMBERSHIP_SIDE.HOST,
        memberships,
      )

      // hostOrg (if any and user is part of it)
      if (this.membership.side === SPACE_MEMBERSHIP_SIDE.HOST && space.hostDxOrg) {
        try {
          const hostOrgMembers: OrgFindMembersReponse = await this.client.orgFindMembers({
            orgDxid: space.hostDxOrg,
          })
          await this.checkPermissions(host_members, hostOrgMembers.results, space)
        } catch (err) {
          this.ctx.log.warn({ error: err })
        }
      }

      // guestOrg (if any and user is part of it)
      if (this.membership.side === SPACE_MEMBERSHIP_SIDE.GUEST && space.guestDxOrg) {
        try {
          const guestOrgMembers: OrgFindMembersReponse = await this.client.orgFindMembers({
            orgDxid: space.guestDxOrg,
          })
          await this.checkPermissions(guest_members, guestOrgMembers.results, space)
        } catch (err) {
          this.ctx.log.warn({ error: err })
        }
      }
    }
  }

  async checkPermissions(pfdaMembers: SpaceMembership[], platformMembers: PlatformMember[], space: Space) {
    if (pfdaMembers.length !== platformMembers.length) {
      const side: string = pfdaMembers.length > platformMembers.length ? 'PFDA' : 'PLATFORM'
      this.ctx.log.warn(
        { pfdaMembers: pfdaMembers.map(m => ({ user: m.user.getEntity().dxuser, role: SPACE_MEMBERSHIP_ROLE[m.role] })), platformMembers, space: space.id },
        'SyncSpacesPermissionsOperation: MEMBERS MISMATCH - %s has more members, PFDA: %d, PLATFORM: %d',
        side, pfdaMembers.length, platformMembers.length,
      )
      await this.fixPermissions(pfdaMembers, platformMembers, space)
    } else {
      for (const member of pfdaMembers) {
        await this.validateUserRole(member, platformMembers, space)
      }
    }
  }

  async fixPermissions(pfdaMembers: SpaceMembership[], platformMembers: PlatformMember[], space: Space): Promise<void> {
    // fixing Platform to match pFDA state
    this.ctx.log.warn(
      {},
      'SyncSpacesPermissionsOperation: Trying to fix space_id: %d platform members.',
      space.id,
    )
    // add all missing members from pFDA to Platform
    for (const pfdaMember of pfdaMembers) {
      const foundPlatformMember = platformMembers.find(m => m.id === `user-${pfdaMember.user.getEntity().dxuser}`)
      if (!foundPlatformMember) {
        await this.addPlatformPermissions(pfdaMember, space)
      }
    }
    // remove all users from platform that does not have pFDA membership
    // DISABLED FOR NOW.
    // for (const platformMember of platformMembers) {
    //   const foundPfdaMember = pfdaMembers.find(m => `user-${m.user.getEntity().dxuser}` === platformMember.id)
    //   if (!foundPfdaMember) {
    //     await this.removePlatformPermissions(platformMember, space)
    //   }
    // }
  }

 /**
   * TO BE REFACTORED
   * ----
   * TODO(Jiri) refactor outside of ops into a platform permission service.
   * TODO(Jiri) refactor to return the platform response - to be able to react to failed requests.
   */
  async addPlatformPermissions(pfdaMembership: SpaceMembership, space: Space): Promise<void> {
    const pfdaUserHandle = pfdaMembership.user.getEntity().dxuser
    const invitee = `user-${pfdaUserHandle}`
    let data: any = {
      invitee,
      level: pfdaMembership.isAdminOrLead() ? 'ADMIN' : 'MEMBER',
      suppressEmailNotification: true, // do not notify user
    }

    if (!pfdaMembership.isAdminOrLead()) {
      data = {
        ...{
          projectsAccess: pfdaMembership.isContributor() ? 'CONTRIBUTE' : 'VIEW',
          allowBillableActivities: false,
          appAccess: pfdaMembership.isContributor(),
        },
        ...data,
      }
    }

    const params: UserInviteToOrgParams = {
      orgDxId: this.membership.side === SPACE_MEMBERSHIP_SIDE.GUEST ? space.guestDxOrg : space.hostDxOrg,
      data,
    }
    const response = await this.client.inviteUserToOrganization(params)
    if (response.id !== null && response.state === 'accepted') {
      this.ctx.log.warn(
        {},
        'SyncSpacesPermissionsOperation: Successfully added missing member %s to organization %s on the platform.',
        invitee, params.orgDxId,
      )
    } else {
      this.ctx.log.warn(
        { response },
        'SyncSpacesPermissionsOperation: There was an error adding missing member %s to organization %s on the platform.',
        invitee, params.orgDxId,
      )
    }
  }

  async validateUserRole(pfdaMembership: SpaceMembership, platformMembers: PlatformMember[], space: Space): Promise<void> {
    const pfdaUserHandle = pfdaMembership.user.getEntity().dxuser
    const platformMember = platformMembers.find(m => m.id === `user-${pfdaUserHandle}`)

    // check for admin & leads
    if (pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.ADMIN || pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.LEAD) {
      if (platformMember && (platformMember.projectAccess !== 'ADMINISTER' || platformMember.level !== 'ADMIN')) {
        // never seen this in the logs - probably is not happening at all.
        this.logWrongPermissions(platformMember, pfdaMembership, space)
      } else if (!platformMember) {
        this.logMissingPermissions(pfdaMembership, platformMembers, space)
        await this.addPlatformPermissions(pfdaMembership, space)
      }
      // check for other roles
    } else if (pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR || pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.VIEWER) {
      if (platformMember && platformMember.level !== 'MEMBER') {
        // never seen this in the logs - probably is not happening at all.
        this.logWrongPermissions(platformMember, pfdaMembership, space)
      } else if (!platformMember) {
        this.logMissingPermissions(pfdaMembership, platformMembers, space)
        await this.addPlatformPermissions(pfdaMembership, space)
      }
    }
  }

  logWrongPermissions(platformMember: PlatformMember, pfdaMembership: SpaceMembership, space: Space): void {
    this.ctx.log.warn(
      { platformMember, pfdaMembership, space },
      'SyncSpacesPermissionsOperation: Space\'s platform permissions are wrong.',
    )
  }

  logMissingPermissions(pfdaMembership: SpaceMembership, platformMembers: PlatformMember[], space: Space): void {
    this.ctx.log.warn(
      { platformMembers, pfdaMembership, space },
      'SyncSpacesPermissionsOperation: Space\'s platform permissions are completely missing for user.',
    )
  }
}
