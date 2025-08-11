import { Injectable } from '@nestjs/common'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { SearchResultMapper } from '@shared/facade/search/result-mapper/search-result-mapper'

@Injectable()
export class SearchResultExpertQuestionMapper extends SearchResultMapper<'expertQuestion'> {
  async getTitle(expertQuestion: ExpertQuestion): Promise<string> {
    const expert = await expertQuestion.expert.load()
    const expertUser = await expert.user.load()

    return expertUser.fullName
  }

  async getDescription(expertQuestion: ExpertQuestion): Promise<string> {
    return expertQuestion.body
  }
}
