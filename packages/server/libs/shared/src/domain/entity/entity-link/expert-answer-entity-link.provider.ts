import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { ExpertAnswer } from '@shared/domain/expert-answer/entity/expert-answer.entity'

@Injectable()
export class ExpertAnswerEntityLinkProvider extends EntityLinkProvider<'expertAnswer'> {
  protected async getRelativeLink(
    expertAnswer: ExpertAnswer,
  ): Promise<`/experts/${number}/expert_questions/${number}`> {
    const question = await expertAnswer.question.load()
    const expert = await question.expert.load()

    return `/experts/${expert.id}/expert_questions/${question.id}` as const
  }
}
