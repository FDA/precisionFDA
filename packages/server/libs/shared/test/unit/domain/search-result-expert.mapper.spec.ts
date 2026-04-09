import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { User } from '@shared/domain/user/user.entity'
import { SearchResultExpertMapper } from '@shared/facade/search/result-mapper/search-result-expert-mapper'

describe('SearchResultExpertMapper', () => {
  const USER_FULLNAME = 'USER_FULLNAME'
  const USER = { load: async (): Promise<User> => ({ fullName: USER_FULLNAME }) as unknown as User }
  const BLOG = 'BLOG'
  const EXPERT = { meta: { _blog: BLOG }, user: USER } as unknown as Expert

  const LINK = 'LINK'

  const getEntityUiLinkStub = stub()

  beforeEach(() => {
    getEntityUiLinkStub.reset()
    getEntityUiLinkStub.throws()
    getEntityUiLinkStub.withArgs(EXPERT).returns(LINK)
  })

  it('should provide correct mapped result', async () => {
    const res = await getInstance().map(EXPERT)

    expect(res).to.deep.equal({
      title: USER_FULLNAME,
      description: BLOG,
      link: LINK,
    })
  })

  function getInstance(): SearchResultExpertMapper {
    const entityService = {
      getEntityUiLink: getEntityUiLinkStub,
    } as unknown as EntityService

    return new SearchResultExpertMapper(entityService)
  }
})
