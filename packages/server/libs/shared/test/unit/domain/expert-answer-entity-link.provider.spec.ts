import { expect } from 'chai'
import { config } from '@shared/config'
import { ExpertAnswerEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-answer-entity-link.provider'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { ExpertAnswer } from '@shared/domain/expert-answer/entity/expert-answer.entity'

describe('ExpertAnswerEntityLinkProvider', () => {
  const EXPERT_ID = 1
  const QUESTION_ID = 10
  const EXPERT_ANSWER = {
    question: {
      load: async () => ({
        id: QUESTION_ID,
        expert: {
          load: async (): Promise<Expert> => ({ id: EXPERT_ID }) as Expert,
        },
      }),
    },
  } as unknown as ExpertAnswer

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(EXPERT_ANSWER)

    expect(res).to.equal(`${config.api.railsHost}/experts/${EXPERT_ID}/expert_questions/${QUESTION_ID}`)
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(EXPERT_ANSWER, { absolute: false })

    expect(res).to.equal(`/experts/${EXPERT_ID}/expert_questions/${QUESTION_ID}`)
  })

  function getInstance(): ExpertAnswerEntityLinkProvider {
    return new ExpertAnswerEntityLinkProvider()
  }
})
