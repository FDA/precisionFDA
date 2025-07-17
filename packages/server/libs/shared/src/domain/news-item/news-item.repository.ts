import { NewsItem } from './news-item.entity'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'

export class NewsRepository extends PaginatedRepository<NewsItem> {
  async getDistinctYears(): Promise<number[]> {
    const allYears: { year: number }[] = await this.em.execute(
      'SELECT DISTINCT YEAR(created_at) as year FROM news_items ORDER BY year DESC',
    )
    return allYears.map((y) => y.year)
  }
}
