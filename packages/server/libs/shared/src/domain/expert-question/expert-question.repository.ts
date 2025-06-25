import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'

export class ExpertQuestionRepository extends PaginatedRepository<ExpertQuestion> {}
