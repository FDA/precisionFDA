import { EntityRepository } from '@mikro-orm/mysql'
import { Expert, ExpertScope } from './expert.entity'


// todo(samuel): Extract PaginationParams to a common interface file
// note: similar in job.repository.ts
interface PaginationParams {
  page: number
  limit: number
}

interface ExpertFindPaginatedParams extends PaginationParams {
  year?: number
}

// todo(samuel) find a way to unify
// Duplicate from API package
interface UserCtx {
  id: number
  accessToken: string
  dxuser: string
}

export class ExpertRepository extends EntityRepository<Expert> {
  private getQueryViewableBy(userCtx: UserCtx | undefined, canAdministerSite: boolean, year?: number) {
    const qb = this.em.createQueryBuilder(Expert,'e');
    // NOTE have to use query builder, to preserve functionality, as YEAR sql function is user
    let query = qb.select('*');
    if (userCtx?.id && userCtx.dxuser && userCtx.accessToken) {
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

  findPaginated(input: ExpertFindPaginatedParams, userCtx: UserCtx | undefined, canAdministerSite: boolean = false) {
    const { page, limit, year } = input
    const offset = (page - 1) * limit
    const selectQuery = this.getQueryViewableBy(userCtx, canAdministerSite, year)
      .limit(limit)
      .offset(offset);
    const countQuery = this.getQueryViewableBy(userCtx, canAdministerSite, year)
      .count('id');
    return Promise.all([selectQuery.execute<Expert[]>(), countQuery.execute<number>()])
  }

  findYears() {
    const qb = this.em.createQueryBuilder(Expert,'e');
    return qb.select('YEAR(`e`.created_at) AS `year`', true).orderBy({
      createdAt: -1
    }).execute<{year: number}[]>().then((experts) => experts.map((expert) => expert.year));
  }
}
