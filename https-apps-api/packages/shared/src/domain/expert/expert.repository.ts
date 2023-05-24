import { wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mysql'
import { PaginationParams } from '../../types/common';
import { Expert, ExpertScope } from './expert.entity'
import { serializeExpert } from './expert.serializer';

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

  async findPaginated(input: ExpertFindPaginatedParams, userCtx: UserCtx | undefined, canAdministerSite: boolean = false) {
    const { page, limit, year } = input
    const offset = (page - 1) * limit
    const baseQuery = this.getQueryViewableBy(userCtx, canAdministerSite, year)
    const countQuery = baseQuery.clone()
      .count('id');
    const selectQuery = baseQuery
      .orderBy({
        createdAt: -1
      })
      .limit(limit)
      .offset(offset);
    const [experts, countResult ] = await Promise.all([selectQuery.execute<Expert[]>(), countQuery.execute<[{count: number}]>()])
    const { count } = countResult[0];
    const totalPages = Math.ceil(count / limit)
    const serializedExperts =  await Promise.all(experts.map(async (expert) => {
      const mappedExpert = this.map(expert)
      // NOTE(samuel) - mikro-orm doesn't parse serialized json as we don't use json sql columns in db
      // At least not for dev environment
      const serializedExpert = await serializeExpert(mappedExpert)
      // Note(samuel) - this is to eliminate collections that aren't initialized
      return serializedExpert
    }))

    return {
      experts: serializedExperts,
      meta: {
        current_page: page,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
        total_pages: totalPages,
        total_count: count
      }
    }
  }

  findYears() {
    const qb = this.em.createQueryBuilder(Expert,'e');
    const yearFragment = 'YEAR(`e`.created_at)'
    return qb.select(yearFragment, true).orderBy({
      [yearFragment]: -1
    }).execute<{[yearFragment]: number}[]>().then((experts) => {
      return experts.map((expert) => expert[yearFragment])
    })
  }
}
