import { EntityRepository } from '@mikro-orm/mysql'
import { Expert, ExpertScope } from './expert.entity'


// todo: Extract PaginationParams to a common interface file
// note: similar in job.repository.ts
interface PaginationParams {
  page: number
  limit: number
}

interface ExpertFindPaginatedParams extends PaginationParams {
  year?: number
}

// TODO find a way to unify
// Duplicate from API package
interface UserCtx {
  id: number
  accessToken: string
  dxuser: string
}

export class ExpertRepository extends EntityRepository<Expert> {
  private getQueryViewableBy(userCtx: UserCtx, canAdministerSite: boolean, year?: number) {
    const qb = this.em.createQueryBuilder(Expert,'e');
    // TODO(samuel) find a way to substitute with asterisk
    // * dealing with bug with incorrect subsitution for mysql 5.6
    // let query = qb.select('e.*');
    // NOTE have to use query builder, to preserve functionality, as YEAR sql function is user
    let query = qb.select('*');
    if (userCtx.id && userCtx.dxuser && userCtx.accessToken) {
      if (!canAdministerSite) {
        query = query.where({
          user: {
            id: userCtx.id
          }
        }).orWhere({
          scope: ExpertScope.PUBLIC
        });
      }
    } else {
      query = query.where({
        scope: ExpertScope.PUBLIC
      })
    }
    if (year) {
      query = query.andWhere(`YEAR(\`e\`.created_at) = ${year}`)
    }
    return query;
  }

  findPaginated(input: ExpertFindPaginatedParams, userCtx: UserCtx, canAdministerSite: boolean) {
    const { page, limit, year } = input
    const offset = (page - 1) * limit
    const selectQuery = this.getQueryViewableBy(userCtx, canAdministerSite, year)
      .limit(limit)
      .offset(offset);
    const countQuery = this.getQueryViewableBy(userCtx, canAdministerSite, year)
      .count('id');
    return Promise.all([selectQuery.execute<Expert[]>(), countQuery.execute<number>()])
  }
}
