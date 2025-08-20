import { Injectable } from '@nestjs/common'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { ExpertQuestionRepository } from '@shared/domain/expert-question/repository/expert-question.repository'
import { Searchable } from '@shared/interface/searchable'

@Injectable()
export class ExpertQuestionService implements Searchable<ExpertQuestion> {
  constructor(private readonly expertQuestionRepository: ExpertQuestionRepository) {}

  async search(query: string): Promise<ExpertQuestion[]> {
    if (!query) {
      return []
    }

    return this.expertQuestionRepository.searchByBody(query)
  }
}
