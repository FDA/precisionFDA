import { partition } from 'ramda'
import { Space } from '../space.entity'
import { SpaceMembership } from '../../space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../../space-membership/space-membership.enum'
import { SPACE_TYPE } from '../space.enum'
import { UserOpsCtx } from '../../../types'
import { PlatformClient } from '../../../platform-client'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { FindSpaceMembersReponse, PlatformMember } from '../../../platform-client/platform-client.responses'

type SyncSpacesPermissionsInput = {}


export class SyncSpacesPermissionsOperation extends WorkerBaseOperation<
UserOpsCtx,
SyncSpacesPermissionsInput,
void
> {
  protected client: PlatformClient

  async run(input: SyncSpacesPermissionsInput): Promise<void> {
    this.client = new PlatformClient(this.ctx.log)
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
      let myMembership: SpaceMembership | null = null
      // eslint-disable-next-line no-await-in-loop
      const memberships = await space.spaceMemberships.loadItems()
      for (const member of memberships) {
        // eslint-disable-next-line no-await-in-loop
        await member.user.load()
        if (!myMembership && member.user.id === userId) {
          myMembership = member
        }
      }
      if (myMembership) {
        this.ctx.log.warn(
          {},
          'SyncSpacesPermissionsOperation: CHECKING space_id: %d, type: %s, side: %s on behalf of %s',
          space.id, SPACE_TYPE[space.type], SPACE_MEMBERSHIP_SIDE[myMembership.side], this.ctx.user.dxuser,
        )
      } else {
        this.ctx.log.warn(
          {},
          'Triggering user membership was not found for space_id: %s, SKIPPING CHECK',
        )
        continue
      }


      const [host_members, guest_members] = partition(
        (sm: SpaceMembership) => sm.side === SPACE_MEMBERSHIP_SIDE.HOST,
        memberships,
      )

      // hostOrg (if any and user is part of it)
      if (myMembership.side === SPACE_MEMBERSHIP_SIDE.HOST && space.hostDxOrg) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const hostOrgMembers: FindSpaceMembersReponse = await this.client.findSpaceMembers({
            spaceOrg: space.hostDxOrg,
            accessToken: this.ctx.user.accessToken,
          })
          this.validateRoles(host_members, hostOrgMembers.results, space)
        } catch (err) {
          this.ctx.log.info({ error: err })
        }
      }

      // guestOrg (if any and user is part of it)
      if (myMembership.side === SPACE_MEMBERSHIP_SIDE.GUEST && space.guestDxOrg) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const guestOrgMembers: FindSpaceMembersReponse = await this.client.findSpaceMembers({
            spaceOrg: space.guestDxOrg,
            accessToken: this.ctx.user.accessToken,
          })
          this.validateRoles(guest_members, guestOrgMembers.results, space)
        } catch (err) {
          this.ctx.log.info({ error: err })
        }
      }
    }
  }

  validateRoles(pfdaMembers: SpaceMembership[], platformMembers: PlatformMember[], space: Space): void {
    if (pfdaMembers.length !== platformMembers.length) {
      const side: string = pfdaMembers.length > platformMembers.length ? 'PFDA' : 'PLATFORM'
      this.ctx.log.warn(
        { pfdaMembers, platformMembers, space: space.id },
        'SyncSpacesPermissionsOperation: MEMBERS MISMATCH - %s has more members, PFDA: %d, PLATFORM: %d',
        side, pfdaMembers.length, platformMembers.length,
      )
    } else {
      for (const member of pfdaMembers) {
        this.validateUserRole(member, platformMembers, space)
      }
    }
  }

  validateUserRole(pfdaMembership: SpaceMembership, platformMembers: PlatformMember[], space: Space): void {
    const pfdaUserHandle = pfdaMembership.user.getEntity().dxuser
    const platformMember = platformMembers.find(m => m.id === `user-${pfdaUserHandle}`)

    // check for admin & leads
    if (pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.ADMIN || pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.LEAD) {
      if (platformMember && (platformMember.projectAccess !== 'ADMINISTER' || platformMember.level !== 'ADMIN')) {
        this.logWrongPermissions(platformMember, pfdaMembership, space)
      }
      else if (!platformMember) {
        this.logMissingPermissions(pfdaMembership, platformMembers, space)
      }
      // check for other roles
    } else if (pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR || pfdaMembership.role === SPACE_MEMBERSHIP_ROLE.VIEWER) {
      if (platformMember && platformMember.level !== 'MEMBER') {
        this.logWrongPermissions(platformMember, pfdaMembership, space)
      }
      else if (!platformMember) {
        this.logMissingPermissions(pfdaMembership, platformMembers, space)
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
