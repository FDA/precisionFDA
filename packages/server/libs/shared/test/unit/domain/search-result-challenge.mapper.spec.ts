import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SearchResultChallengeMapper } from '@shared/facade/search/result-mapper/search-result-challenge-mapper'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SearchResultChallengeMapper', () => {
  const NAME = 'NAME'
  const DESCRIPTION = 'DESCRIPTION'
  const CHALLENGE = { name: NAME, description: DESCRIPTION } as unknown as Challenge

  const LINK = 'LINK'

  const getEntityUiLinkStub = stub()

  beforeEach(() => {
    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(CHALLENGE).returns(LINK)
  })

  it('should provide correct mapped result', async () => {
    const res = await getInstance().map(CHALLENGE)

    expect(res).to.deep.equal({
      title: NAME,
      description: DESCRIPTION,
      link: LINK,
    })
  })

  function getInstance(): SearchResultChallengeMapper {
    const entityService = {
      getEntityUiLink: getEntityUiLinkStub,
    } as unknown as EntityService

    return new SearchResultChallengeMapper(entityService)
  }
})
