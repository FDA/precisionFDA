import { PaginatedRepository } from '../../database/repository/paginated.repository'
import { ADMIN_GROUP_ROLES } from '../admin-group/admin-group.entity'
import { AdminMembership } from './admin-membership.entity'

export class AdminMembershipRepository extends PaginatedRepository<AdminMembership> {
  async findByUserAndGroup(userId: number, groupRole: ADMIN_GROUP_ROLES): Promise<AdminMembership | null> {
    return this.findOne({
      user: { id: userId },
      adminGroup: { role: groupRole },
    })
  }
}
