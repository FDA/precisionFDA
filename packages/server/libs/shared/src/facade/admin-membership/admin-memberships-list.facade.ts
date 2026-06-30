import { Injectable } from '@nestjs/common'
import { ADMIN_GROUP_ROLES } from '@shared/domain/admin-group/admin-group.entity'
import { AdminMembershipPaginationDTO } from '@shared/domain/admin-membership/dto/admin-membership-pagination.dto'
import { ChallengeLeadsDTO } from '@shared/domain/admin-membership/dto/challenge-leads.dto'
import { UserWithAdminRolesDTO } from '@shared/domain/admin-membership/dto/user-with-admin-roles.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { UserService } from '@shared/domain/user/service/user.service'

@Injectable()
export class AdminMembershipsListFacade {
  constructor(private readonly userService: UserService) {}

  async listUsersWithRoles(query: AdminMembershipPaginationDTO): Promise<PaginatedResult<UserWithAdminRolesDTO>> {
    const result = await this.userService.paginateUsersWithAdminRoles(query)
    return {
      data: result.data.map(UserWithAdminRolesDTO.fromEntity),
      meta: result.meta,
    }
  }

  async listChallengeLeads(): Promise<ChallengeLeadsDTO> {
    return {
      hostUsernames: await this.userService.listDxusersForAdminRoles([
        ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
        ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
      ]),
      guestUsernames: await this.userService.listDxusersForAdminRoles([
        ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
        ADMIN_GROUP_ROLES.ROLE_CHALLENGE_ADMIN,
        ADMIN_GROUP_ROLES.ROLE_CHALLENGE_EVALUATOR,
      ]),
    }
  }
}
