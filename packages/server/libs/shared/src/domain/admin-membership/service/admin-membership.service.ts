import { Injectable, Logger } from '@nestjs/common'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { AdminGroupRepository } from '@shared/domain/admin-group/admin-group.repository'
import { AdminMembership } from '@shared/domain/admin-membership/admin-membership.entity'
import { AdminMembershipRepository } from '@shared/domain/admin-membership/admin-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class AdminMembershipService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly adminGroupRepo: AdminGroupRepository,
    private readonly adminMembershipRepo: AdminMembershipRepository,
  ) {}

  async findAdminGroupOrFail(role: ADMIN_GROUP_ROLES): Promise<AdminGroup> {
    return this.adminGroupRepo.findOneOrFail({ role })
  }

  async findMembership(id: number): Promise<AdminMembership | null> {
    return this.adminMembershipRepo.findOne(id, {
      populate: ['user', 'adminGroup'],
    })
  }

  async createRecord(user: User, adminGroup: AdminGroup): Promise<AdminMembership> {
    const membership = new AdminMembership(user, adminGroup)
    await this.adminMembershipRepo.persistAndFlush(membership)
    this.logger.log(`Admin membership created with id=${membership.id} for user=${user.id}, role=${adminGroup.role}`)
    return membership
  }

  removeRecord(membership: AdminMembership): void {
    this.adminMembershipRepo.remove(membership)
    this.logger.log(`Removed admin membership id=${membership.id}`)
  }
}
