import { config } from '@shared/config'
import { ExpertQuestionEntityLinkProvider } from '@shared/domain/entity/entity-link/expert-question-entity-link.provider'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { expect } from 'chai'

describe('ExpertQuestionEntityLinkProvider', () => {
  const EXPERT_ID = 1
  const EXPERT_QUESTION_ID = 10
  const EXPERT_QUESTION = {
    id: EXPERT_QUESTION_ID,
    expert: { load: () => ({ id: EXPERT_ID }) },
  } as unknown as ExpertQuestion

  it('should provide correct absolute link', async () => {
    const res = await getInstance().getLink(EXPERT_QUESTION)

    expect(res).to.equal(
      `${config.api.railsHost}/experts/${EXPERT_ID}/expert_questions/${EXPERT_QUESTION_ID}`,
    )
  })

  it('should provide correct relative link', async () => {
    const res = await getInstance().getLink(EXPERT_QUESTION, { absolute: false })

    expect(res).to.equal(`/experts/${EXPERT_ID}/expert_questions/${EXPERT_QUESTION_ID}`)
  })

  function getInstance(): ExpertQuestionEntityLinkProvider {
    return new ExpertQuestionEntityLinkProvider()
  }
})
