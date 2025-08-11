import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'

export class ExpertQuestionRepository extends PaginatedRepository<ExpertQuestion> {
  async searchByBody(query: string): Promise<ExpertQuestion[]> {
    const sql = `
      SELECT DISTINCT q.*
      FROM expert_questions q
      WHERE q.id IN (
        -- Questions that match directly
        SELECT id
        FROM expert_questions
        WHERE MATCH(body) AGAINST(? IN NATURAL LANGUAGE MODE)

        UNION

        -- Questions whose answers match
        SELECT expert_question_id
        FROM expert_answers
        WHERE MATCH(body) AGAINST(? IN NATURAL LANGUAGE MODE))
      ORDER BY q.created_at DESC
    `

    const results = await this.em.execute(sql, [query, query])
    return results.map((row) => this.em.map(ExpertQuestion, row))
  }
}
