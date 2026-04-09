import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { Expert } from '@shared/domain/expert/entity/expert.entity'

export class ExpertRepository extends PaginatedRepository<Expert> {
  async searchByMeta(query: string): Promise<Expert[]> {
    const sql = `
      SELECT *
      FROM experts
      WHERE MATCH(meta) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY MATCH(meta) AGAINST(? IN NATURAL LANGUAGE MODE) DESC
    `

    const results = await this.em.execute(sql, [query, query])
    return results.map(row => this.em.map(Expert, row))
  }
}
