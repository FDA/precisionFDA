import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'

@Injectable()
export class ExpertQuestionEntityLinkProvider extends EntityLinkProvider<'expertQuestion'> {
  protected async getRelativeLink(
    expertQuestion: ExpertQuestion,
  ): Promise<`/experts/${number}/expert_questions/${number}`> {
    const expert = await expertQuestion.expert.load()

    return `/experts/${expert.id}/expert_questions/${expertQuestion.id}` as const
  }
}
