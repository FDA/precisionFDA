import { ExpertQuestionRepository } from '@shared/domain/expert-question/repository/expert-question.repository'
import { ExpertQuestionService } from '@shared/domain/expert-question/service/expert-question.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('ExpertQuestionEntityLinkProvider', () => {
  const QUERY = 'QUERY'
  const RESULT = 'RESULT'

  const searchByBodyStub = stub()

  beforeEach(() => {
    searchByBodyStub.reset()
    searchByBodyStub.throws()
    searchByBodyStub.withArgs(QUERY).resolves(RESULT)
  })

  it('return empty set for empty query', async () => {
    const res = await getInstance().search(null)

    expect(res).to.deep.equal([])
  })

  it('should return the result of repo search', async () => {
    const res = await getInstance().search(QUERY)

    expect(res).to.equal(RESULT)
  })

  function getInstance(): ExpertQuestionService {
    const repo = {
      searchByBody: searchByBodyStub,
    } as unknown as ExpertQuestionRepository

    return new ExpertQuestionService(repo)
  }
})
