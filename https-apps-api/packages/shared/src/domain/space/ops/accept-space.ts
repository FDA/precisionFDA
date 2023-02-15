import { EntityManager } from '@mikro-orm/mysql'
import { PlatformClient } from '../../../platform-client'
import { Space, SpaceMembership } from '../..'
import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../../space-membership/space-membership.enum'
import { SPACE_TYPE } from '../space.enum'
import { spaceActionPolicy } from '../space.action-policy'
import { getOppositeOrgDxid, getOrgDxid, getProjectDxid, isAcceptedBy, setOrgDxid, setProjectDxid } from '../space.helper'
import { errors } from '../../..'

type SpaceAcceptInput = { spaceId: number }

export class SpaceAcceptOperation extends BaseOperation<
UserOpsCtx,
SpaceAcceptInput,
void
> {
  private platformClient: PlatformClient
  private em: EntityManager

  async run(input: SpaceAcceptInput): Promise<void> {
    this.platformClient = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    this.em = this.ctx.em

    const userId = this.ctx.user.id
    const spaceRepo = this.em.getRepository(Space)
    let space = await spaceRepo.findOneOrFail(
      { id: input.spaceId },
      { populate: ['spaceMemberships', 'spaceMemberships.user', 'spaceMemberships.user.organization'] },
    )

    let confidentialSpaces = await spaceRepo.find(
      { spaceId: input.spaceId },
      { populate: ['spaceMemberships'] },
    )

    const currentLead = space.spaceMemberships.getItems().find(sm => sm.user.getEntity().id === userId)
    if (!currentLead) {
      throw new errors.InvalidStateError('You cannot accept space you are not member of.')
    }

    if (spaceActionPolicy.canAccept(space, confidentialSpaces, currentLead)) {
      await this.acceptSpace(space, confidentialSpaces, currentLead)
    }

    space = await spaceRepo.findOneOrFail(
      { id: input.spaceId },
      { populate: ['spaceMemberships', 'spaceMemberships.user', 'spaceMemberships.user.organization'] },
    )
    confidentialSpaces = await spaceRepo.find(
      { spaceId: input.spaceId },
      { populate: ['spaceMemberships'] },
    )

    if (this.isAccepted(space, confidentialSpaces)) {
      await this.activate(space, confidentialSpaces)
    }
  }

  isAccepted = (space: Space, confidentialSpaces: Space[]): boolean => {
    const isExlusive = (space.spaceId !== null && space.spaceId === space.id)
    || [SPACE_TYPE.PRIVATE_TYPE, SPACE_TYPE.GOVERNMENT, SPACE_TYPE.ADMINISTRATOR].includes(space.type)

    if (isExlusive) {
      return true
    }

    const leads = space.spaceMemberships.getItems().filter(sm => sm.role === SPACE_MEMBERSHIP_ROLE.LEAD)
    return isAcceptedBy(space, confidentialSpaces, leads[0]) && isAcceptedBy(space, confidentialSpaces, leads[1])
  }

  async activate(space: Space, confidentialSpaces: Space[]) {
    space.state = 1
    confidentialSpaces.forEach((cs: Space) => {
      cs.state = 1
    })
    await this.em.flush()

    // TODO: notification email still on ruby side, missing template in node
  }

  async acceptSpace(space: Space, confidentialSpaces: Space[], admin: SpaceMembership) {
    await this.acceptSpaceByType(space, confidentialSpaces, admin)
    await this.em.flush()
  }

  async acceptSpaceByType(space: Space, confidentialSpaces: Space[], admin: SpaceMembership) {
    switch (space.type) {
      case SPACE_TYPE.REVIEW: await this.handleReviewSpaceAccept(space, confidentialSpaces, admin)
        break
      case SPACE_TYPE.VERIFICATION: throw new errors.InvalidStateError('Verification space is deprecated and cannot be accepted.')
      case SPACE_TYPE.GOVERNMENT:
      case SPACE_TYPE.ADMINISTRATOR:
      case SPACE_TYPE.GROUPS: await this.handleSpaceAccept(space, admin)
        break
      default: break
    }
  }

  async handleReviewSpaceAccept(space: Space, confidentialSpaces: Space[], admin: SpaceMembership) {
    if (admin.side === SPACE_MEMBERSHIP_SIDE.HOST) {
      confidentialSpaces.filter((cs: Space) => cs.hostDxOrg !== null)[0]?.spaceMemberships.add(admin)
      return
    }
    if (getProjectDxid(space, admin) !== null) {
      return
    }
    await this.handleSpaceAccept(space, admin)
    // accept as regular space + some extra logic for review space type
    // @ts-ignore
    const newSpace = this.em.create(Space, {
      name: space.name,
      description: space.description,
      type: space.type,
      meta: space.meta,
      state: space.state,
      spaceId: space.id,
      protected: space.protected,
    })
    await this.em.persistAndFlush(newSpace)

    const newProjectRes = await this.platformClient.projectCreate({
      name: `precisionfda-${newSpace.uid}-${SPACE_MEMBERSHIP_SIDE[admin.side]}-PRIVATE`,
      admin,
    })

    const contributeOrg = getOrgDxid(space, admin)
    setOrgDxid(newSpace, admin, contributeOrg)
    setProjectDxid(newSpace, admin, newProjectRes.id)

    await this.platformClient.projectInvite({
      projectDxid: newProjectRes.id,
      invitee: contributeOrg,
      level: 'CONTRIBUTE',
    })

    newSpace.spaceMemberships.add(admin)
  }

  private async handleSpaceAccept(space: Space, admin: SpaceMembership) {
    const newProjectRes = await this.platformClient.projectCreate({
      space,
      admin,
    })

    const contributeOrg = getOrgDxid(space, admin)
    const oppositeOrg = getOppositeOrgDxid(space, admin)

    // THIS CANNOT RUN IN PARALLEL - will cause 'failed to aquire lock to change object' platform error
    await this.platformClient.projectInvite({
      projectDxid: newProjectRes.id,
      invitee: contributeOrg,
      level: 'CONTRIBUTE',
    })

    await this.platformClient.projectInvite({
      projectDxid: newProjectRes.id,
      invitee: oppositeOrg,
      level: 'CONTRIBUTE',
    })
    // previously there was a call to project invite review_app_developers_org as well. Trying spaces without it.

    if (admin.isHost()) {
      space.hostProject = newProjectRes.id
    } else {
      space.guestProject = newProjectRes.id
    }
  }
}

