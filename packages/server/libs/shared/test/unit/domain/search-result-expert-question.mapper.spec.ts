import { EntityService } from '@shared/domain/entity/entity.service'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { User } from '@shared/domain/user/user.entity'
import { SearchResultExpertQuestionMapper } from '@shared/facade/search/result-mapper/search-result-expert-question-mapper'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SearchResultExpertQuestionMapper', () => {
  const USER_FULLNAME = 'USER_FULLNAME'
  const USER = { load: async (): Promise<User> => ({ fullName: USER_FULLNAME }) as unknown as User }
  const EXPERT = { load: async (): Promise<Expert> => ({ user: USER }) as unknown as Expert }
  const BODY = 'BODY'
  const EXPERT_QUESTION = { expert: EXPERT, body: BODY } as unknown as ExpertQuestion

  const LINK = 'LINK'

  const getEntityUiLinkStub = stub()

  beforeEach(() => {
    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(EXPERT_QUESTION).returns(LINK)
  })

  it('should provide correct mapped result', async () => {
    const res = await getInstance().map(EXPERT_QUESTION)

    expect(res).to.deep.equal({
      title: USER_FULLNAME,
      description: BODY,
      link: LINK,
    })
  })

  function getInstance(): SearchResultExpertQuestionMapper {
    const entityService = {
      getEntityUiLink: getEntityUiLinkStub,
    } as unknown as EntityService

    return new SearchResultExpertQuestionMapper(entityService)
  }
})
