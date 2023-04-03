import { QBQueryOrderMap } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mysql'
import { PaginationParams } from '../../types/common'
import { NewsItem } from './news-item.entity'

interface NewsFindPaginatedParams extends PaginationParams {
  year?: number
  type?: 'article' | 'publication'
}

// todo(samuel) find a way to unify
// Duplicate from API package
interface UserCtx {
  id: number
  accessToken: string
  dxuser: string
}

export class NewsRepository extends EntityRepository<NewsItem> {
  async findPaginated(input: NewsFindPaginatedParams, orderBy: QBQueryOrderMap<NewsItem> = {}) {
    const qb = this.em.createQueryBuilder(NewsItem, 'e')
    const { page, limit, year, type } = input
    const offset = (page - 1) * limit

    let whereType = {}
    if (type === 'article') whereType = { isPublication: false }
    if (type === 'publication') whereType = { isPublication: true }

    let whereYear = {}
    if (year) whereYear = `YEAR(\`e\`.created_at) = ${year}`

    const baseQuery = qb
      .where(whereYear)
      .andWhere({...whereType, published: true })

    const countQuery = baseQuery.clone().count('id');
    let selectQuery = baseQuery
      .orderBy({
        ...orderBy,
      })
      .limit(limit)
      .offset(offset)

    const [newsItems, countResult] = await Promise.all([selectQuery.execute<NewsItem[]>(), countQuery.execute<[{ count: number }]>()])
    const { count } = countResult[0]
    const totalPages = Math.ceil(count / limit)
    return {
      news_items: newsItems,
      meta: {
        current_page: page,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
        total_pages: totalPages,
        total_count: count
      }
    }
  }

  async findYears() {
    const qb = this.em.createQueryBuilder(NewsItem, 'e');
    const yearFragment = 'YEAR(`e`.created_at)'
    return qb.select(yearFragment, true).orderBy({
      [yearFragment]: -1
    }).execute<{ year: number }[]>().then((newsList) => newsList.map((n) => n.year));
  }
}
