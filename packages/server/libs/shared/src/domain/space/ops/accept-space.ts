import { EntityManager } from '@mikro-orm/mysql'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { InvalidStateError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { BaseOperation } from '@shared/utils/base-operation'
import { UserOpsCtx } from '@shared/types'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../../space-membership/space-membership.enum'
import { SPACE_TYPE } from '../space.enum'
import { spaceActionPolicy } from '../space.action-policy'
import { getOppositeOrgDxid, getOrgDxid, getProjectDxid, isAcceptedBy, setOrgDxid, setProjectDxid } from '../space.helper'
import { NotificationService } from '../../notification/services/notification.service'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'

type SpaceAcceptInput = { spaceId: number }


export class SpaceAcceptOperation extends BaseOperation<
UserOpsCtx,
SpaceAcceptInput,
void
> {
  private platformClient: PlatformClient
  private em: EntityManager

  async run(input: SpaceAcceptInput): Promise<void> {
    this.platformClient = new PlatformClient(
      { accessToken: this.ctx.user.accessToken },
      this.ctx.log,
    )
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
      throw new InvalidStateError('You cannot accept space you are not member of.')
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

    const notificationService = new NotificationService(this.em)
    const leads = space.spaceMemberships.getItems().filter(sm => sm.role === SPACE_MEMBERSHIP_ROLE.LEAD)

    // send notification to all leads
    leads.forEach(lead => {
      notificationService.createNotification({
        message: `Space ${space.name} has been activated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.SPACE_ACTIVATED,
        userId: lead.user.id,
      })
    })
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
      case SPACE_TYPE.VERIFICATION: throw new InvalidStateError('Verification space is deprecated and cannot be accepted.')
      case SPACE_TYPE.GOVERNMENT:
      case SPACE_TYPE.ADMINISTRATOR:
      case SPACE_TYPE.GROUPS: await this.handleSpaceAccept(space, admin)
        break
      default: break
    }
  }

  async handleReviewSpaceAccept(space: Space, confidentialSpaces: Space[], admin: SpaceMembership) {
    if (admin.side === SPACE_MEMBERSHIP_SIDE.HOST) {
      await this.handleHostProjectAcceptTransfer(space, admin)

      const confidentialSpace = confidentialSpaces.filter((cs: Space) => cs.hostDxOrg !== null)[0]
      if (confidentialSpace) {
        confidentialSpace.spaceMemberships.add(admin)
        await this.handleHostProjectAcceptTransfer(confidentialSpace, admin)
      }

      return
    }
    if (getProjectDxid(space, admin) !== null) {
      return
    }
    await this.handleSpaceAccept(space, admin)
    // accept as regular space + some extra logic for review space type

    const newMeta = { ...space.meta, restricted_discussions: false }

    const newSpace = this.em.create(Space, {
      name: space.name,
      description: space.description,
      type: space.type,
      meta: newMeta,
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

  private async handleHostProjectAcceptTransfer(space: Space, admin: SpaceMembership) {
    const project = await this.platformClient.projectDescribe({
      projectDxid: space.hostProject,
      body: {fields: {pendingTransfer: true}}
    })
    if (project.pendingTransfer) {
      await this.platformClient.projectAcceptTransfer({
        projectDxid: space.hostProject,
        billTo: `org-pfda..${admin.user.getProperty('organization').getProperty('handle')}`,
      })
    }
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

