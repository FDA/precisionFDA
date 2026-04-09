import { expect } from 'chai'
import { stub } from 'sinon'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { ExpertService } from '@shared/domain/expert/services/expert.service'
import { ExpertQuestionService } from '@shared/domain/expert-question/service/expert-question.service'
import { EntityTypeToSearchResultMapperMap } from '@shared/facade/search/domain/entity-type-to-search-result-mapper.map'
import { SearchFacade } from '@shared/facade/search/search.facade'

describe('SearchResultExpertQuestionMapper', () => {
  const CHALLENGE_QUERY = 'CHALLENGE_QUERY'
  const EXPERT_QUERY = 'EXPERT_QUERY'
  const EXPERT_QUESTION_QUERY = 'EXPERT_QUESTION_QUERY'

  const CHALLENGE_SEARCH_RESULT = 'CHALLENGE_SEARCH_RESULT'
  const EXPERT_SEARCH_RESULT = 'EXPERT_SEARCH_RESULT'
  const EXPERT_QUESTION_SEARCH_RESULT = 'EXPERT_QUESTION_SEARCH_RESULT'

  const CHALLENGE_MAP_RESULT = 'CHALLENGE_MAP_RESULT'
  const EXPERT_MAP_RESULT = 'EXPERT_MAP_RESULT'
  const EXPERT_QUESTION_MAP_RESULT = 'EXPERT_QUESTION_MAP_RESULT'

  const challengeSearchStub = stub()
  const expertSearchStub = stub()
  const expertQuestionSearchStub = stub()

  const challengeMapStub = stub()
  const expertMapStub = stub()
  const expertQuestionMapStub = stub()

  beforeEach(() => {
    challengeSearchStub.reset()
    challengeSearchStub.throws()
    challengeSearchStub.withArgs(CHALLENGE_QUERY).resolves([CHALLENGE_SEARCH_RESULT])

    expertSearchStub.reset()
    expertSearchStub.throws()
    expertSearchStub.withArgs(EXPERT_QUERY).resolves([EXPERT_SEARCH_RESULT])

    expertQuestionSearchStub.reset()
    expertQuestionSearchStub.throws()
    expertQuestionSearchStub.withArgs(EXPERT_QUESTION_QUERY).resolves([EXPERT_QUESTION_SEARCH_RESULT])

    challengeMapStub.reset()
    challengeMapStub.throws()
    challengeMapStub.withArgs(CHALLENGE_SEARCH_RESULT).returns(CHALLENGE_MAP_RESULT)

    expertMapStub.reset()
    expertMapStub.throws()
    expertMapStub.withArgs(EXPERT_SEARCH_RESULT).returns(EXPERT_MAP_RESULT)

    expertQuestionMapStub.reset()
    expertQuestionMapStub.throws()
    expertQuestionMapStub.withArgs(EXPERT_QUESTION_SEARCH_RESULT).returns(EXPERT_QUESTION_MAP_RESULT)
  })

  it('should provide correct result for challenges', async () => {
    const res = await getInstance().search(CHALLENGE_QUERY, 'challenge')

    expect(res).to.deep.equal([CHALLENGE_MAP_RESULT])
  })

  it('should provide correct result for experts', async () => {
    const res = await getInstance().search(EXPERT_QUERY, 'expert')

    expect(res).to.deep.equal([EXPERT_MAP_RESULT])
  })

  it('should provide correct result for expert questions', async () => {
    const res = await getInstance().search(EXPERT_QUESTION_QUERY, 'expertQuestion')

    expect(res).to.deep.equal([EXPERT_QUESTION_MAP_RESULT])
  })

  function getInstance(): SearchFacade {
    const challengeService = {
      search: challengeSearchStub,
    } as unknown as ChallengeService

    const expertService = {
      search: expertSearchStub,
    } as unknown as ExpertService

    const expertQuestionService = {
      search: expertQuestionSearchStub,
    } as unknown as ExpertQuestionService

    const challengeMapper = {
      map: challengeMapStub,
    }

    const expertMapper = {
      map: expertMapStub,
    }

    const expertQuestionMapper = {
      map: expertQuestionMapStub,
    }

    const entityTypeToResultMapperMap = {
      challenge: challengeMapper,
      expert: expertMapper,
      expertQuestion: expertQuestionMapper,
    } as unknown as EntityTypeToSearchResultMapperMap

    return new SearchFacade(challengeService, expertService, expertQuestionService, entityTypeToResultMapperMap)
  }
})
