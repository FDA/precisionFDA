import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Inject, Query } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { ADMIN_GROUP_ROLES, AdminGroup } from '@shared/domain/admin-group/admin-group.entity'
import { Expert } from '@shared/domain/expert/expert.entity'
import { ExpertFindPaginatedParams } from '@shared/domain/expert/expert.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { expertListQuerySchema } from './experts.schemas'

// NOTE infered from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

@Controller('/experts')
export class ExpertsController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
  ) {}

  @Get()
  async listExperts(
    @Query(new JsonSchemaPipe(expertListQuerySchema)) query: ExpertFindPaginatedParams,
  ) {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const year = query.year ?? null

    // TODO(samuel) find a way to apply user.isSiteAdmin method
    const canUserAdministerSite =
      this.user &&
      (await this.em.findOne(AdminGroup, {
        role: ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
        adminMemberships: {
          user: {
            id: this.user.id,
          },
        },
      }))

    return await this.em.getRepository(Expert).findPaginated(
      {
        page,
        limit,
        year,
      },
      this.user,
      Boolean(canUserAdministerSite),
    )
  }

  @Get('/years')
  async getYears() {
    const result = await this.em.execute(
      'SELECT distinct YEAR(created_at) as year FROM experts order by year desc',
    )

    return result.map((y) => y.year)
  }
}
