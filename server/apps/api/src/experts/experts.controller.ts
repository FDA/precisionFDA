import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, Inject, Query } from '@nestjs/common'
import { adminGroup, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, entities, UserContext } from '@shared'
import { ExpertFindPaginatedParams } from '@shared/domain/expert/expert.repository'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import { expertListQuerySchema } from './experts.schemas'

// NOTE infered from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

@Controller('/experts')
export class ExpertsController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
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
      (await this.em.findOne(entities.AdminGroup, {
        role: adminGroup.ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
        adminMemberships: {
          user: {
            id: this.user.id,
          },
        },
      }))

    return await this.em.getRepository(entities.Expert).findPaginated(
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
    return await this.em.getRepository(entities.Expert).findYears()
  }
}
