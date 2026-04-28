import { EntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { OrgActionRequestService } from '@shared/domain/org-action-request/org-action-request.service'
import { Organization } from '@shared/domain/org/organization.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/service/user.service'
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class OrgMemberActionFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly userCtx: UserContext,
    private readonly userService: UserService,
    private readonly orgActionRequestService: OrgActionRequestService,
  ) {}

  /**
   * Deactivates an organization member directly.
   * Only the org admin can deactivate non-admin members in their org.
   */
  async deactivateOrgUser(targetUserId: number): Promise<void> {
    const { org, currentUser } = await this.loadOrgAdminContext()

    const targetUser = await this.userService.getUserInOrganization(targetUserId, org.id)
    if (!targetUser) {
      throw new NotFoundError('User not found in your organization')
    }

    if (targetUser.id === org.admin?.id) {
      throw new PermissionError('Cannot deactivate the organization administrator')
    }

    if (targetUser.userState === USER_STATE.DEACTIVATED) {
      throw new InvalidStateError('User is already deactivated')
    }

    targetUser.userState = USER_STATE.DEACTIVATED
    await this.em.flush()

    this.logger.log(
      `User ${targetUserId} deactivated by org admin ${currentUser.id} in org ${org.id}`,
    )
  }

  /**
   * Creates a request to remove an organization member.
   * The request must be approved by an FDA site admin before taking effect.
   */
  async removeOrgMember(targetUserId: number): Promise<void> {
    const { org, currentUser } = await this.loadOrgAdminContext()

    const targetUser = await this.userService.getUserInOrganization(targetUserId, org.id)
    if (!targetUser) {
      throw new NotFoundError('User not found in your organization')
    }

    if (targetUser.id === org.admin?.id) {
      throw new PermissionError('Cannot remove the organization administrator')
    }

    const existingRequest = await this.orgActionRequestService.findPendingRemoveMemberRequest(
      org.id,
      targetUserId,
    )

    if (existingRequest) {
      throw new InvalidStateError('A removal request for this user already exists')
    }

    await this.orgActionRequestService.createRemoveMemberRequest(org.id, currentUser.id, targetUserId)

    this.logger.log(
      `Remove member request created for user ${targetUserId} by org admin ${currentUser.id} in org ${org.id}`,
    )
  }

  private async loadOrgAdminContext(): Promise<{ org: Organization; currentUser: User }> {
    const currentUser = await this.userCtx.loadEntity()
    await this.em.populate(currentUser, ['organization', 'organization.admin'])

    const org = currentUser.organization.getEntity()

    if (org.singular) {
      throw new PermissionError('This action is not available for singular organizations')
    }

    if (org.admin?.id !== currentUser.id) {
      throw new PermissionError('Only organization administrators can perform this action')
    }

    return { org, currentUser }
  }
}
